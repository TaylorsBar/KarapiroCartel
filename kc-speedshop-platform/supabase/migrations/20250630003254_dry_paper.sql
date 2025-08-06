/*
  # Supplier Integration Schema

  1. New Tables
    - `suppliers` - Supplier business profiles and settings
    - `inventory_items` - Supplier inventory management
    - `pricing_rules` - Automated pricing rules
    - `supplier_orders` - Order fulfillment tracking
    - `reorder_requests` - Automatic reorder management

  2. Security
    - Enable RLS on all new tables
    - Add policies for supplier access control

  3. Features
    - Supplier onboarding and verification
    - Inventory management with auto-reorder
    - Dynamic pricing rules
    - Order fulfillment tracking
    - Performance analytics
*/

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('manufacturer', 'distributor', 'retailer', 'individual')),
  tax_id text,
  business_address jsonb DEFAULT '{}',
  contact_info jsonb DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  performance_metrics jsonb DEFAULT '{"rating": 0, "total_orders": 0, "fulfillment_rate": 0, "response_time": 0}',
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  commission_rate decimal(5,4) DEFAULT 0.15,
  auto_pricing_enabled boolean DEFAULT false,
  inventory_sync_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  sku text NOT NULL,
  quantity_available integer DEFAULT 0,
  quantity_reserved integer DEFAULT 0,
  reorder_point integer DEFAULT 10,
  reorder_quantity integer DEFAULT 50,
  cost_price decimal(10,2) NOT NULL,
  markup_percentage decimal(5,2) DEFAULT 50.00,
  auto_reorder_enabled boolean DEFAULT false,
  last_restocked timestamptz,
  location text,
  condition text DEFAULT 'new' CHECK (condition IN ('new', 'refurbished', 'used')),
  warranty_period integer DEFAULT 12, -- months
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pricing rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  rule_type text NOT NULL CHECK (rule_type IN ('category', 'brand', 'part_specific', 'competitor')),
  conditions jsonb DEFAULT '{}',
  markup_type text NOT NULL CHECK (markup_type IN ('percentage', 'fixed_amount')),
  markup_value decimal(10,2) NOT NULL,
  min_price decimal(10,2),
  max_price decimal(10,2),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Supplier orders table
CREATE TABLE IF NOT EXISTS supplier_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status text DEFAULT 'received' CHECK (status IN ('received', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  fulfillment_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reorder requests table
CREATE TABLE IF NOT EXISTS reorder_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  requested_quantity integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  supplier_response text,
  estimated_arrival timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Competitor prices table (for price monitoring)
CREATE TABLE IF NOT EXISTS competitor_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id uuid REFERENCES parts(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'NZD',
  availability text,
  last_checked timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Suppliers policies
CREATE POLICY "Users can manage own supplier profile"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Inventory items policies
CREATE POLICY "Suppliers can manage own inventory"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = inventory_items.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Pricing rules policies
CREATE POLICY "Suppliers can manage own pricing rules"
  ON pricing_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = pricing_rules.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Supplier orders policies
CREATE POLICY "Suppliers can view own orders"
  ON supplier_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = supplier_orders.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update own orders"
  ON supplier_orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = supplier_orders.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Reorder requests policies
CREATE POLICY "Suppliers can manage own reorder requests"
  ON reorder_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = reorder_requests.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Competitor prices policies (read-only for suppliers)
CREATE POLICY "Suppliers can view competitor prices"
  ON competitor_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_verification_status ON suppliers(verification_status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_part_id ON inventory_items(part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_quantity ON inventory_items(quantity_available);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_supplier_id ON pricing_rules(supplier_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier_id ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_order_id ON supplier_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS idx_reorder_requests_supplier_id ON reorder_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_reorder_requests_status ON reorder_requests(status);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_part_id ON competitor_prices(part_id);

-- Create unique constraints
ALTER TABLE suppliers ADD CONSTRAINT suppliers_user_id_unique UNIQUE (user_id);
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_supplier_sku_unique UNIQUE (supplier_id, sku);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON supplier_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reorder_requests_updated_at BEFORE UPDATE ON reorder_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();