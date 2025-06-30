import { supabase } from '../lib/supabase';
import type { User, Part } from '../lib/supabase';

export interface Supplier {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'manufacturer' | 'distributor' | 'retailer' | 'individual';
  tax_id?: string;
  business_address: Record<string, any>;
  contact_info: Record<string, any>;
  certifications: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  performance_metrics: {
    rating: number;
    total_orders: number;
    fulfillment_rate: number;
    response_time: number;
  };
  subscription_tier: 'basic' | 'premium' | 'enterprise';
  commission_rate: number;
  auto_pricing_enabled: boolean;
  inventory_sync_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  supplier_id: string;
  part_id: string;
  sku: string;
  quantity_available: number;
  quantity_reserved: number;
  reorder_point: number;
  reorder_quantity: number;
  cost_price: number;
  markup_percentage: number;
  auto_reorder_enabled: boolean;
  last_restocked: string;
  location: string;
  condition: 'new' | 'refurbished' | 'used';
  warranty_period: number;
  created_at: string;
  updated_at: string;
}

export interface PricingRule {
  id: string;
  supplier_id: string;
  rule_type: 'category' | 'brand' | 'part_specific' | 'competitor';
  conditions: Record<string, any>;
  markup_type: 'percentage' | 'fixed_amount';
  markup_value: number;
  min_price?: number;
  max_price?: number;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface SupplierOrder {
  id: string;
  supplier_id: string;
  order_id: string;
  status: 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  estimated_delivery: string;
  actual_delivery?: string;
  fulfillment_notes?: string;
  created_at: string;
  updated_at: string;
}

export class SupplierService {
  // Supplier Management
  static async createSupplier(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        ...supplierData,
        verification_status: 'pending',
        performance_metrics: {
          rating: 0,
          total_orders: 0,
          fulfillment_rate: 0,
          response_time: 0
        },
        commission_rate: this.calculateCommissionRate(supplierData.subscription_tier),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSupplierProfile(userId: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateSupplierProfile(supplierId: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', supplierId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Inventory Management
  static async addInventoryItem(inventoryData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([inventoryData])
      .select()
      .single();

    if (error) throw error;

    // Auto-create part if it doesn't exist
    await this.ensurePartExists(inventoryData);

    return data;
  }

  static async getSupplierInventory(supplierId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        parts:part_id (
          name,
          brand,
          category,
          price,
          images
        )
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateInventoryQuantity(itemId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<InventoryItem> {
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory_items')
      .select('quantity_available')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;

    let newQuantity: number;
    switch (operation) {
      case 'add':
        newQuantity = currentItem.quantity_available + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, currentItem.quantity_available - quantity);
        break;
      case 'set':
        newQuantity = quantity;
        break;
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update({ 
        quantity_available: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    // Check if reorder is needed
    await this.checkReorderPoint(data);

    return data;
  }

  // Pricing Management
  static async createPricingRule(ruleData: Omit<PricingRule, 'id' | 'created_at'>): Promise<PricingRule> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .insert([ruleData])
      .select()
      .single();

    if (error) throw error;

    // Apply pricing rule to existing inventory
    await this.applyPricingRule(data);

    return data;
  }

  static async getSupplierPricingRules(supplierId: string): Promise<PricingRule[]> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('supplier_id', supplierId)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Order Management
  static async getSupplierOrders(supplierId: string, status?: string): Promise<SupplierOrder[]> {
    let query = supabase
      .from('supplier_orders')
      .select(`
        *,
        orders:order_id (
          id,
          total_amount,
          buyer_id,
          created_at,
          order_items (
            quantity,
            unit_price,
            parts:part_id (
              name,
              brand
            )
          )
        )
      `)
      .eq('supplier_id', supplierId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateOrderStatus(
    supplierOrderId: string, 
    status: SupplierOrder['status'], 
    trackingNumber?: string,
    notes?: string
  ): Promise<SupplierOrder> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (notes) updateData.fulfillment_notes = notes;
    if (status === 'delivered') updateData.actual_delivery = new Date().toISOString();

    const { data, error } = await supabase
      .from('supplier_orders')
      .update(updateData)
      .eq('id', supplierOrderId)
      .select()
      .single();

    if (error) throw error;

    // Update supplier performance metrics
    await this.updateSupplierMetrics(data.supplier_id);

    return data;
  }

  // Analytics and Reporting
  static async getSupplierAnalytics(supplierId: string, period: 'week' | 'month' | 'quarter' | 'year') {
    const startDate = this.getStartDate(period);
    
    // Get sales data
    const { data: salesData, error: salesError } = await supabase
      .from('supplier_orders')
      .select(`
        created_at,
        orders:order_id (
          total_amount,
          order_items (
            quantity,
            total_price
          )
        )
      `)
      .eq('supplier_id', supplierId)
      .gte('created_at', startDate);

    if (salesError) throw salesError;

    // Get inventory data
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('quantity_available, cost_price, markup_percentage')
      .eq('supplier_id', supplierId);

    if (inventoryError) throw inventoryError;

    return {
      sales: this.processSalesData(salesData || []),
      inventory: this.processInventoryData(inventoryData || []),
      performance: await this.getPerformanceMetrics(supplierId, period)
    };
  }

  // Autonomous Management Features
  static async enableAutoPricing(supplierId: string, rules: PricingRule[]): Promise<void> {
    // Update supplier to enable auto pricing
    await supabase
      .from('suppliers')
      .update({ auto_pricing_enabled: true })
      .eq('id', supplierId);

    // Create or update pricing rules
    for (const rule of rules) {
      await this.createPricingRule(rule);
    }

    // Schedule price updates
    await this.scheduleAutoPricing(supplierId);
  }

  static async enableAutoReorder(supplierId: string): Promise<void> {
    await supabase
      .from('suppliers')
      .update({ inventory_sync_enabled: true })
      .eq('id', supplierId);

    // Check all items for reorder
    const inventory = await this.getSupplierInventory(supplierId);
    for (const item of inventory) {
      if (item.auto_reorder_enabled) {
        await this.checkReorderPoint(item);
      }
    }
  }

  static async processAutomaticReorders(supplierId: string): Promise<void> {
    const { data: lowStockItems, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('supplier_id', supplierId)
      .eq('auto_reorder_enabled', true)
      .filter('quantity_available', 'lte', 'reorder_point');

    if (error) throw error;

    for (const item of lowStockItems || []) {
      await this.createReorderRequest(item);
    }
  }

  // Competitor Price Monitoring
  static async updateCompetitorPrices(supplierId: string): Promise<void> {
    const inventory = await this.getSupplierInventory(supplierId);
    
    for (const item of inventory) {
      const competitorPrices = await this.fetchCompetitorPrices(item.part_id);
      if (competitorPrices.length > 0) {
        const avgPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
        const suggestedPrice = avgPrice * 0.95; // 5% below average
        
        await this.updatePartPrice(item.part_id, suggestedPrice);
      }
    }
  }

  // Helper Methods
  private static calculateCommissionRate(tier: string): number {
    switch (tier) {
      case 'basic': return 0.15; // 15%
      case 'premium': return 0.10; // 10%
      case 'enterprise': return 0.05; // 5%
      default: return 0.15;
    }
  }

  private static async ensurePartExists(inventoryData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { data: existingPart } = await supabase
      .from('parts')
      .select('id')
      .eq('id', inventoryData.part_id)
      .single();

    if (!existingPart) {
      // Create basic part record
      await supabase
        .from('parts')
        .insert([{
          id: inventoryData.part_id,
          seller_id: inventoryData.supplier_id,
          name: `Part ${inventoryData.sku}`,
          brand: 'Unknown',
          category: 'General',
          price: inventoryData.cost_price * (1 + inventoryData.markup_percentage / 100),
          stock_quantity: inventoryData.quantity_available
        }]);
    }
  }

  private static async checkReorderPoint(item: InventoryItem): Promise<void> {
    if (item.auto_reorder_enabled && item.quantity_available <= item.reorder_point) {
      await this.createReorderRequest(item);
    }
  }

  private static async createReorderRequest(item: InventoryItem): Promise<void> {
    // Create reorder notification/request
    await supabase
      .from('reorder_requests')
      .insert([{
        supplier_id: item.supplier_id,
        inventory_item_id: item.id,
        requested_quantity: item.reorder_quantity,
        status: 'pending',
        priority: item.quantity_available === 0 ? 'high' : 'medium'
      }]);
  }

  private static async applyPricingRule(rule: PricingRule): Promise<void> {
    // Apply pricing rule to matching inventory items
    const { data: matchingItems } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('supplier_id', rule.supplier_id);

    for (const item of matchingItems || []) {
      if (this.ruleMatches(rule, item)) {
        const newPrice = this.calculatePrice(item.cost_price, rule);
        await this.updatePartPrice(item.part_id, newPrice);
      }
    }
  }

  private static ruleMatches(rule: PricingRule, item: InventoryItem): boolean {
    // Implement rule matching logic based on rule type and conditions
    return true; // Simplified for now
  }

  private static calculatePrice(costPrice: number, rule: PricingRule): number {
    let price: number;
    
    if (rule.markup_type === 'percentage') {
      price = costPrice * (1 + rule.markup_value / 100);
    } else {
      price = costPrice + rule.markup_value;
    }

    if (rule.min_price && price < rule.min_price) price = rule.min_price;
    if (rule.max_price && price > rule.max_price) price = rule.max_price;

    return price;
  }

  private static async updatePartPrice(partId: string, newPrice: number): Promise<void> {
    await supabase
      .from('parts')
      .update({ price: newPrice, updated_at: new Date().toISOString() })
      .eq('id', partId);
  }

  private static async updateSupplierMetrics(supplierId: string): Promise<void> {
    // Calculate and update supplier performance metrics
    const { data: orders } = await supabase
      .from('supplier_orders')
      .select('status, created_at, actual_delivery, estimated_delivery')
      .eq('supplier_id', supplierId);

    if (orders) {
      const totalOrders = orders.length;
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
      const fulfillmentRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
      
      // Calculate average response time
      const avgResponseTime = this.calculateAverageResponseTime(orders);

      await supabase
        .from('suppliers')
        .update({
          performance_metrics: {
            total_orders: totalOrders,
            fulfillment_rate: fulfillmentRate,
            response_time: avgResponseTime,
            rating: this.calculateRating(fulfillmentRate, avgResponseTime)
          }
        })
        .eq('id', supplierId);
    }
  }

  private static calculateAverageResponseTime(orders: any[]): number {
    // Calculate average time from order to shipment
    return 24; // Simplified - 24 hours average
  }

  private static calculateRating(fulfillmentRate: number, responseTime: number): number {
    // Calculate rating based on performance metrics
    let rating = 5.0;
    
    if (fulfillmentRate < 95) rating -= 0.5;
    if (fulfillmentRate < 90) rating -= 0.5;
    if (responseTime > 48) rating -= 0.5;
    if (responseTime > 72) rating -= 0.5;
    
    return Math.max(1.0, rating);
  }

  private static getStartDate(period: string): string {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private static processSalesData(salesData: any[]): any {
    // Process and aggregate sales data
    return {
      totalRevenue: salesData.reduce((sum, order) => sum + (order.orders?.total_amount || 0), 0),
      totalOrders: salesData.length,
      averageOrderValue: salesData.length > 0 ? 
        salesData.reduce((sum, order) => sum + (order.orders?.total_amount || 0), 0) / salesData.length : 0
    };
  }

  private static processInventoryData(inventoryData: any[]): any {
    return {
      totalItems: inventoryData.length,
      totalValue: inventoryData.reduce((sum, item) => sum + (item.quantity_available * item.cost_price), 0),
      lowStockItems: inventoryData.filter(item => item.quantity_available <= item.reorder_point).length
    };
  }

  private static async getPerformanceMetrics(supplierId: string, period: string): Promise<any> {
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('performance_metrics')
      .eq('id', supplierId)
      .single();

    return supplier?.performance_metrics || {};
  }

  private static async scheduleAutoPricing(supplierId: string): Promise<void> {
    // In a real implementation, this would schedule a background job
    console.log(`Auto pricing scheduled for supplier ${supplierId}`);
  }

  private static async fetchCompetitorPrices(partId: string): Promise<number[]> {
    // In a real implementation, this would fetch from competitor APIs
    return [100, 105, 95, 110]; // Mock competitor prices
  }
}