import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  user_type: 'customer' | 'mechanic' | 'dealer' | 'admin';
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  mileage: number;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticScan {
  id: string;
  user_id: string;
  vehicle_id: string;
  vin: string;
  trouble_codes: string[];
  raw_data: Record<string, any>;
  scan_timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface AIInterpretation {
  id: string;
  diagnostic_scan_id: string;
  interpretation: string;
  confidence_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  currency: string;
  possible_causes: string[];
  recommendations: string[];
  ai_model: string;
  created_at: string;
}

export interface Part {
  id: string;
  seller_id: string;
  name: string;
  brand: string;
  part_number?: string;
  category: string;
  description?: string;
  price: number;
  currency: string;
  stock_quantity: number;
  compatibility: string[];
  specifications: Record<string, any>;
  images: string[];
  blockchain_verified: boolean;
  blockchain_tx_id?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  currency: string;
  payment_method: 'card' | 'hbar' | 'bank_transfer';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Record<string, any>;
  blockchain_tx_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  part_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface WorkshopBay {
  id: string;
  name: string;
  bay_type: 'standard' | 'performance' | 'vip';
  equipment: string[];
  features: string[];
  hourly_rate: number;
  currency: string;
  status: 'available' | 'maintenance' | 'unavailable';
  created_at: string;
  updated_at: string;
}

export interface WorkshopBooking {
  id: string;
  user_id: string;
  bay_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_cost: number;
  currency: string;
  project_description?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface BlockchainTransaction {
  id: string;
  user_id: string;
  transaction_type: 'payment' | 'parts_auth' | 'diagnostic' | 'contract';
  hedera_tx_id: string;
  consensus_timestamp?: string;
  amount?: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserRewards {
  id: string;
  user_id: string;
  points_balance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tier_progress: number;
  lifetime_points: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description?: string;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}