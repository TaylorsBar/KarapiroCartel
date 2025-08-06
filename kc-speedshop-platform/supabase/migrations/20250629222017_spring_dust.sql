/*
  # Seed Initial Data for Karapiro Cartel Platform

  1. Workshop Bays
    - Create initial workshop bays with different tiers
    - Standard, Performance, and VIP bays

  2. Sample Parts
    - Add sample automotive parts for testing
    - Different categories and price ranges

  3. Sample Users (for development)
    - Test user accounts with different tiers
*/

-- Insert workshop bays
INSERT INTO workshop_bays (name, bay_type, equipment, features, hourly_rate) VALUES
  (
    'Performance Bay 1',
    'performance',
    '["Hydraulic Lift", "Dyno", "Diagnostic Tools", "Air Compressor", "Professional Toolbox"]',
    '["Climate Controlled", "Toolbox Access", "Fluid Disposal", "WiFi"]',
    75.00
  ),
  (
    'Standard Bay 2',
    'standard',
    '["Hydraulic Lift", "Basic Tools", "Air Compressor"]',
    '["Fluid Disposal", "Toolbox Access"]',
    45.00
  ),
  (
    'VIP Performance Bay 3',
    'vip',
    '["Hydraulic Lift", "Dyno", "Diagnostic Tools", "Air Compressor", "Welding Equipment", "Professional Toolbox"]',
    '["Climate Controlled", "Toolbox Access", "Fluid Disposal", "Lounge Access", "WiFi", "Refreshments"]',
    85.00
  ),
  (
    'Standard Bay 4',
    'standard',
    '["Hydraulic Lift", "Basic Tools", "Air Compressor"]',
    '["Fluid Disposal", "Toolbox Access"]',
    45.00
  ),
  (
    'Performance Bay 5',
    'performance',
    '["Hydraulic Lift", "Dyno", "Diagnostic Tools", "Air Compressor", "Alignment Equipment"]',
    '["Climate Controlled", "Toolbox Access", "Fluid Disposal", "WiFi"]',
    75.00
  );

-- Note: Sample parts and users will be added through the application
-- to ensure proper authentication and user management