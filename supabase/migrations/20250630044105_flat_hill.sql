/*
  # Populate Sample Data for Marketplace

  1. Sample Parts Data
    - Add realistic automotive parts with proper categories
    - Include various brands and price ranges
    - Set up proper stock quantities and descriptions

  2. Sample Supplier Data
    - Create sample supplier profiles
    - Link parts to suppliers for enhanced marketplace

  3. Sample Inventory Data
    - Create inventory items for suppliers
    - Set up proper stock levels and pricing
*/

-- Insert sample users for suppliers (these will be created when users sign up)
-- We'll create parts that can be linked to suppliers later

-- Insert sample automotive parts
INSERT INTO parts (name, brand, part_number, category, description, price, currency, stock_quantity, compatibility, specifications, images, blockchain_verified, status) VALUES
  (
    'GT3582R Turbocharger',
    'Garrett',
    'GT3582R-856801-5012S',
    'Engine',
    'High-performance turbocharger with dual ceramic ball bearings for maximum response and power. Suitable for 2.0-4.0L engines producing 475-600hp.',
    1299.99,
    'NZD',
    5,
    '["Nissan Skyline R32-R34", "Toyota Supra A80", "Mitsubishi Evo 8-10", "Subaru WRX STI"]',
    '{"max_power": "600hp", "bearing_type": "Dual Ceramic Ball", "compressor_wheel": "82.5mm", "turbine_wheel": "84mm"}',
    '["https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'BC Racing BR Series Coilovers',
    'BC Racing',
    'BR-RA-HONDA-CIVIC-FK8',
    'Suspension',
    '30-way adjustable damping force, full height adjustability, and camber plates included. Perfect for track and street use.',
    1049.99,
    'NZD',
    8,
    '["Honda Civic Type R FK8", "Honda Civic FK7", "Acura Integra DC5"]',
    '{"adjustment_range": "30-way", "spring_rate_front": "8kg", "spring_rate_rear": "6kg", "camber_plates": true}',
    '["https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'HKS Titanium Cat-Back Exhaust',
    'HKS',
    'HKS-32018-AN013',
    'Exhaust',
    'Lightweight titanium construction with signature HKS sound. Includes all mounting hardware and gaskets.',
    1599.99,
    'NZD',
    3,
    '["Nissan 370Z Z34", "Infiniti G37", "Nissan Skyline V36"]',
    '{"material": "Grade 1 Titanium", "pipe_diameter": "76mm", "weight_reduction": "40%", "sound_level": "95dB"}',
    '["https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Brembo GT Big Brake Kit',
    'Brembo',
    'BREMBO-1N1.9001A',
    'Brakes',
    '6-piston front calipers with 380mm 2-piece rotors for maximum stopping power. Track-proven performance.',
    2499.99,
    'NZD',
    2,
    '["BMW M3 E90-E93", "BMW M4 F82", "Audi RS4 B8-B9"]',
    '{"caliper_pistons": 6, "rotor_diameter": "380mm", "rotor_type": "2-piece floating", "pad_compound": "Racing"}',
    '["https://images.pexels.com/photos/4024484/pexels-photo-4024484.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Skunk2 Pro Series Intake Manifold',
    'Skunk2',
    'SKUNK2-307-05-0350',
    'Engine',
    'Cast aluminum intake manifold with velocity stacks for improved airflow and power gains up to 15hp.',
    699.99,
    'NZD',
    6,
    '["Honda Civic Si", "Acura Integra Type R", "Honda S2000"]',
    '{"material": "Cast Aluminum", "runner_length": "optimized", "throttle_body": "70mm", "power_gain": "10-15hp"}',
    '["https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Voltex Type 7 GT Wing',
    'Voltex',
    'VOLTEX-GT-WING-1600',
    'Exterior',
    'Carbon fiber construction with adjustable angle of attack for optimal downforce. Professional racing heritage.',
    1899.99,
    'NZD',
    4,
    '["Subaru WRX STI", "Mitsubishi Evo X", "Honda Civic Type R"]',
    '{"material": "Carbon Fiber", "width": "1600mm", "adjustable_angle": true, "downforce": "variable"}',
    '["https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'AEM Cold Air Intake System',
    'AEM',
    'AEM-21-8034DC',
    'Engine',
    'Dyno-proven 8-12hp and 6-8 ft-lbs torque gains. Washable synthetic filter included.',
    349.99,
    'NZD',
    12,
    '["Honda Civic Si", "Acura TSX", "Honda Accord"]',
    '{"filter_type": "Synthetic", "pipe_diameter": "3 inch", "power_gain": "8-12hp", "torque_gain": "6-8 ft-lbs"}',
    '["https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Mishimoto Aluminum Radiator',
    'Mishimoto',
    'MMRAD-CIV-92',
    'Cooling',
    'Full aluminum construction with increased core thickness for 25% better cooling efficiency.',
    459.99,
    'NZD',
    7,
    '["Honda Civic EG", "Honda Civic EK", "Honda CRX"]',
    '{"material": "Aluminum", "core_thickness": "42mm", "cooling_improvement": "25%", "weight": "8.5lbs"}',
    '["https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Whiteline Sway Bar Kit',
    'Whiteline',
    'BWK002',
    'Suspension',
    'Adjustable front and rear sway bars for improved handling and reduced body roll.',
    389.99,
    'NZD',
    9,
    '["Subaru WRX", "Subaru STI", "Subaru Forester XT"]',
    '{"adjustability": "3-way", "material": "Steel", "diameter_front": "24mm", "diameter_rear": "20mm"}',
    '["https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Tomei Expreme Ti Catback Exhaust',
    'Tomei',
    'TB6090-NS05A',
    'Exhaust',
    'Pure titanium construction for ultimate weight savings and performance sound.',
    1799.99,
    'NZD',
    3,
    '["Nissan 350Z", "Nissan 370Z", "Infiniti G35"]',
    '{"material": "Pure Titanium", "weight": "9.5kg", "sound_level": "98dB", "pipe_diameter": "80mm"}',
    '["https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Spoon Sports Brake Pads',
    'Spoon Sports',
    'SPOON-45022-DC5-000',
    'Brakes',
    'High-performance brake pads designed for track use with excellent fade resistance.',
    189.99,
    'NZD',
    15,
    '["Honda Civic Type R", "Acura Integra Type R", "Honda S2000"]',
    '{"compound": "Racing", "operating_temp": "200-800°C", "fade_resistance": "Excellent", "rotor_friendly": true}',
    '["https://images.pexels.com/photos/4024484/pexels-photo-4024484.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Cusco Strut Tower Brace',
    'Cusco',
    'CUSCO-965-540-A',
    'Suspension',
    'Aluminum strut tower brace for improved chassis rigidity and handling precision.',
    229.99,
    'NZD',
    11,
    '["Subaru WRX", "Subaru STI", "Toyota 86", "Subaru BRZ"]',
    '{"material": "Aluminum", "weight": "2.1kg", "mounting_points": "3", "finish": "Blue Anodized"}',
    '["https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Greddy Turbo Timer',
    'Greddy',
    'GREDDY-15500214',
    'Electronics',
    'Digital turbo timer with customizable cool-down periods and voltage display.',
    159.99,
    'NZD',
    8,
    '["Universal Fitment"]',
    '{"display": "Digital LCD", "timer_range": "0-9 minutes", "voltage_display": true, "harness_included": true}',
    '["https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Mugen Carbon Fiber Hood',
    'Mugen',
    'MUGEN-60100-XKS-K0S0',
    'Exterior',
    'Lightweight carbon fiber hood with functional vents for improved cooling and aerodynamics.',
    2299.99,
    'NZD',
    2,
    '["Honda Civic Type R FK8"]',
    '{"material": "Carbon Fiber", "weight_reduction": "50%", "vents": "Functional", "finish": "Clear Coat"}',
    '["https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Eibach Pro-Kit Springs',
    'Eibach',
    'E10-85-021-02-22',
    'Suspension',
    'Progressive rate springs for improved handling with maintained ride quality.',
    299.99,
    'NZD',
    14,
    '["BMW 3 Series E90", "BMW 3 Series F30", "BMW 4 Series F32"]',
    '{"drop_front": "30mm", "drop_rear": "25mm", "spring_rate": "Progressive", "TUV_approved": true}',
    '["https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Injen SP Cold Air Intake',
    'Injen',
    'SP1230P',
    'Engine',
    'Polished aluminum intake system with high-flow filter for increased power and sound.',
    279.99,
    'NZD',
    10,
    '["Mazda RX-8", "Mazda RX-7 FD"]',
    '{"material": "Polished Aluminum", "filter_type": "High-Flow", "power_gain": "5-8hp", "sound_enhancement": true}',
    '["https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Stoptech Slotted Brake Rotors',
    'Stoptech',
    'STOPTECH-126.33119SR',
    'Brakes',
    'Slotted brake rotors for improved heat dissipation and consistent braking performance.',
    449.99,
    'NZD',
    6,
    '["Subaru WRX STI", "Mitsubishi Evo X", "Nissan 350Z"]',
    '{"type": "Slotted", "material": "Cast Iron", "coating": "Zinc Plated", "directional": true}',
    '["https://images.pexels.com/photos/4024484/pexels-photo-4024484.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Blitz Nur-Spec VS Exhaust',
    'Blitz',
    'BLITZ-62138',
    'Exhaust',
    'Stainless steel cat-back exhaust system with deep, aggressive tone.',
    899.99,
    'NZD',
    5,
    '["Nissan Skyline R33", "Nissan Skyline R34", "Nissan Silvia S15"]',
    '{"material": "Stainless Steel", "pipe_diameter": "76mm", "tip_diameter": "115mm", "sound_level": "92dB"}',
    '["https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    false,
    'active'
  ),
  (
    'Rays Volk Racing TE37',
    'Rays',
    'RAYS-TE37-18x9.5',
    'Wheels',
    'Legendary forged aluminum wheels with iconic 6-spoke design. Track-proven performance.',
    3299.99,
    'NZD',
    4,
    '["Universal 5x114.3", "Universal 5x100"]',
    '{"size": "18x9.5", "offset": "+22", "bolt_pattern": "5x114.3", "material": "Forged Aluminum", "weight": "8.9kg"}',
    '["https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  ),
  (
    'Nismo Engine Mount Set',
    'Nismo',
    'NISMO-11220-RS540',
    'Engine',
    'Solid engine mounts for improved power transfer and reduced wheel hop.',
    399.99,
    'NZD',
    7,
    '["Nissan 240SX S13", "Nissan 240SX S14", "Nissan Silvia"]',
    '{"type": "Solid", "material": "Aluminum", "vibration": "Increased", "power_transfer": "Maximum"}',
    '["https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=600"]',
    true,
    'active'
  );

-- Insert sample workshop bays (additional to existing ones)
INSERT INTO workshop_bays (name, bay_type, equipment, features, hourly_rate) VALUES
  (
    'Dyno Bay 6',
    'performance',
    '["AWD Dyno", "Hydraulic Lift", "Diagnostic Tools", "Air Compressor", "Tuning Equipment"]',
    '["Climate Controlled", "Dyno Testing", "ECU Tuning", "WiFi", "Refreshments"]',
    120.00
  ),
  (
    'Paint Booth 7',
    'vip',
    '["Paint Booth", "Spray Equipment", "Compressor", "Ventilation System"]',
    '["Climate Controlled", "Professional Lighting", "Dust-Free Environment", "Paint Mixing Station"]',
    95.00
  );