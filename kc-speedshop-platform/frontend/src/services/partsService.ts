import { supabase } from '../lib/supabase';
import type { Part, Order, OrderItem } from '../lib/supabase';

export class PartsService {
  static async getParts(filters?: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    compatibility?: string;
  }): Promise<Part[]> {
    let query = supabase
      .from('parts')
      .select('*')
      .eq('status', 'active')
      .gt('stock_quantity', 0);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.brand) {
      query = query.eq('brand', filters.brand);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.compatibility) {
      query = query.contains('compatibility', [filters.compatibility]);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getPartById(id: string): Promise<Part | null> {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createPart(partData: Omit<Part, 'id' | 'created_at' | 'updated_at'>): Promise<Part> {
    const { data, error } = await supabase
      .from('parts')
      .insert([partData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    const { data, error } = await supabase
      .from('parts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createOrder(orderData: {
    seller_id: string;
    items: Array<{
      part_id: string;
      quantity: number;
      unit_price: number;
    }>;
    shipping_address: Record<string, any>;
    payment_method: 'card' | 'hbar' | 'bank_transfer';
  }): Promise<{ order: Order; items: OrderItem[] }> {
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        seller_id: orderData.seller_id,
        total_amount: totalAmount,
        payment_method: orderData.payment_method,
        shipping_address: orderData.shipping_address,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = orderData.items.map(item => ({
      order_id: order.id,
      part_id: item.part_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select();

    if (itemsError) throw itemsError;

    // Update stock quantities
    for (const item of orderData.items) {
      await this.updateStock(item.part_id, -item.quantity);
    }

    return { order, items: items || [] };
  }

  static async updateStock(partId: string, quantityChange: number): Promise<void> {
    const { data: part, error: fetchError } = await supabase
      .from('parts')
      .select('stock_quantity')
      .eq('id', partId)
      .single();

    if (fetchError) throw fetchError;

    const newQuantity = Math.max(0, part.stock_quantity + quantityChange);

    const { error: updateError } = await supabase
      .from('parts')
      .update({ 
        stock_quantity: newQuantity,
        status: newQuantity === 0 ? 'out_of_stock' : 'active'
      })
      .eq('id', partId);

    if (updateError) throw updateError;
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        parts:part_id (
          name,
          brand,
          images
        )
      `)
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  }

  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('category')
      .eq('status', 'active');

    if (error) throw error;
    
    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories.sort();
  }

  static async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('brand')
      .eq('status', 'active');

    if (error) throw error;
    
    const brands = [...new Set(data?.map(item => item.brand) || [])];
    return brands.sort();
  }

  static async getCompatibleVehicles(): Promise<string[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('compatibility')
      .eq('status', 'active');

    if (error) throw error;
    
    const allCompatibility = data?.flatMap(item => item.compatibility || []) || [];
    const uniqueVehicles = [...new Set(allCompatibility)];
    return uniqueVehicles.sort();
  }

  static async searchParts(searchTerm: string, limit: number = 10): Promise<Part[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('status', 'active')
      .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,part_number.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getFeaturedParts(limit: number = 6): Promise<Part[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('status', 'active')
      .eq('blockchain_verified', true)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getPartsByCategory(category: string, limit: number = 12): Promise<Part[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .gt('stock_quantity', 0)
      .order('price', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getRelatedParts(partId: string, category: string, limit: number = 4): Promise<Part[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .neq('id', partId)
      .gt('stock_quantity', 0)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}