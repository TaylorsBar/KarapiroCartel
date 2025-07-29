import { supabase } from '../lib/supabase';
import type { Part, Order, OrderItem } from '../lib/supabase';

export class PartsService {
  static async getParts(filters?: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
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
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
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

    return { order, items: items || [] };
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
}