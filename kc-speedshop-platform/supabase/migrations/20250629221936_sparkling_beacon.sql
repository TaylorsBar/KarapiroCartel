/*
  # Initial Karapiro Cartel Platform Schema

  1. New Tables
    - `users` - User accounts and profiles
    - `vehicles` - Vehicle information and VIN data
    - `diagnostic_scans` - OBD2 diagnostic scan results
    - `parts` - Automotive parts catalog
    - `orders` - Purchase orders and transactions
    - `workshop_bays` - Workshop bay information
    - `workshop_bookings` - Workshop bay reservations
    - `blockchain_transactions` - Hedera blockchain transaction records
    - `ai_interpretations` - AI diagnostic interpretations
    - `user_rewards` - VIP rewards and points system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access patterns for different user roles

  3. Features
    - User authentication and profiles
    - Vehicle management
    - Diagnostic tracking
    - Parts marketplace
    - Workshop booking system
    - Blockchain integration
    - Rewards system
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  user_type text DEFAULT 'customer' CHECK (user_type IN ('customer', 'mechanic', 'dealer', 'admin')),
  subscription_tier text DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vin text UNIQUE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  engine text,
  transmission text,
  fuel_type text,
  mileage integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Diagnostic scans table
CREATE TABLE IF NOT EXISTS diagnostic_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  vin text NOT NULL,
  trouble_codes jsonb DEFAULT '[]',
  raw_data jsonb DEFAULT '{}',
  scan_timestamp timestamptz DEFAULT now(),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- AI interpretations table
CREATE TABLE IF NOT EXISTS ai_interpretations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_scan_id uuid REFERENCES diagnostic_scans(id) ON DELETE CASCADE,
  interpretation text NOT NULL,
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  urgency_level text DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  estimated_cost_min decimal(10,2),
  estimated_cost_max decimal(10,2),
  currency text DEFAULT 'NZD',
  possible_causes jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  ai_model text DEFAULT 'grok-3-latest',
  created_at timestamptz DEFAULT now()
);

-- Parts catalog table
CREATE TABLE IF NOT EXISTS parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text NOT NULL,
  part_number text,
  category text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'NZD',
  stock_quantity integer DEFAULT 0,
  compatibility jsonb DEFAULT '[]',
  specifications jsonb DEFAULT '{}',
  images jsonb DEFAULT '[]',
  blockchain_verified boolean DEFAULT false,
  blockchain_tx_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'NZD',
  payment_method text DEFAULT 'card' CHECK (payment_method IN ('card', 'hbar', 'bank_transfer')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb DEFAULT '{}',
  blockchain_tx_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Workshop bays table
CREATE TABLE IF NOT EXISTS workshop_bays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bay_type text DEFAULT 'standard' CHECK (bay_type IN ('standard', 'performance', 'vip')),
  equipment jsonb DEFAULT '[]',
  features jsonb DEFAULT '[]',
  hourly_rate decimal(10,2) NOT NULL,
  currency text DEFAULT 'NZD',
  status text DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'unavailable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workshop bookings table
CREATE TABLE IF NOT EXISTS workshop_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  bay_id uuid REFERENCES workshop_bays(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_hours integer NOT NULL,
  total_cost decimal(10,2) NOT NULL,
  currency text DEFAULT 'NZD',
  project_description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blockchain transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('payment', 'parts_auth', 'diagnostic', 'contract')),
  hedera_tx_id text UNIQUE NOT NULL,
  consensus_timestamp timestamptz,
  amount decimal(20,8),
  currency text DEFAULT 'HBAR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  points_balance integer DEFAULT 0,
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  tier_progress integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reward transactions table
CREATE TABLE IF NOT EXISTS reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired')),
  points integer NOT NULL,
  description text,
  reference_id uuid,
  reference_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_bays ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Vehicles policies
CREATE POLICY "Users can manage own vehicles"
  ON vehicles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Diagnostic scans policies
CREATE POLICY "Users can manage own diagnostic scans"
  ON diagnostic_scans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- AI interpretations policies
CREATE POLICY "Users can read interpretations for own scans"
  ON ai_interpretations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM diagnostic_scans 
      WHERE diagnostic_scans.id = ai_interpretations.diagnostic_scan_id 
      AND diagnostic_scans.user_id = auth.uid()
    )
  );

-- Parts policies
CREATE POLICY "Anyone can read active parts"
  ON parts
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Sellers can manage own parts"
  ON parts
  FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id);

-- Orders policies
CREATE POLICY "Users can read own orders as buyer"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can read own orders as seller"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can create orders as buyer"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Order items policies
CREATE POLICY "Users can read order items for own orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Workshop bays policies (public read)
CREATE POLICY "Anyone can read workshop bays"
  ON workshop_bays
  FOR SELECT
  TO authenticated
  USING (true);

-- Workshop bookings policies
CREATE POLICY "Users can manage own bookings"
  ON workshop_bookings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Blockchain transactions policies
CREATE POLICY "Users can read own blockchain transactions"
  ON blockchain_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Users can read own rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own reward transactions"
  ON reward_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_diagnostic_scans_user_id ON diagnostic_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_scans_vehicle_id ON diagnostic_scans(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parts_seller_id ON parts(seller_id);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_user_id ON workshop_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_bay_id ON workshop_bookings(bay_id);
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_date ON workshop_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_user_id ON blockchain_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_hedera_tx_id ON blockchain_transactions(hedera_tx_id);