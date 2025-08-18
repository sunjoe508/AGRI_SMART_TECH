-- Insert sample profiles (users)
INSERT INTO public.profiles (id, full_name, phone_number, county, sub_county, ward, farm_name, crop_types, farm_size_acres) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Kamau', '+254712345678', 'Kiambu', 'Kiambu East', 'Riabai', 'Kamau Family Farm', ARRAY['Maize', 'Beans', 'Tomatoes'], 5.5),
('550e8400-e29b-41d4-a716-446655440002', 'Mary Wanjiku', '+254723456789', 'Nakuru', 'Nakuru East', 'Biashara', 'Wanjiku Greenhouse', ARRAY['Tomatoes', 'Peppers', 'Cucumbers'], 3.2),
('550e8400-e29b-41d4-a716-446655440003', 'Peter Ochieng', '+254734567890', 'Kisumu', 'Kisumu Central', 'Kondele', 'Ochieng Rice Farm', ARRAY['Rice', 'Sweet Potatoes'], 8.7),
('550e8400-e29b-41d4-a716-446655440004', 'Grace Mutindi', '+254745678901', 'Machakos', 'Machakos', 'Kalama', 'Mutindi Organic Farm', ARRAY['Kales', 'Spinach', 'Carrots'], 2.1),
('550e8400-e29b-41d4-a716-446655440005', 'Samuel Kipkorir', '+254756789012', 'Uasin Gishu', 'Eldoret East', 'Kapsoya', 'Kipkorir Dairy Farm', ARRAY['Maize', 'Napier Grass'], 12.3),
('550e8400-e29b-41d4-a716-446655440006', 'Elizabeth Nyong', '+254767890123', 'Meru', 'Imenti North', 'Kiirua', 'Nyong Coffee Farm', ARRAY['Coffee', 'Bananas'], 4.8),
('550e8400-e29b-41d4-a716-446655440007', 'David Mwangi', '+254778901234', 'Murang''a', 'Kiharu', 'Gaturi', 'Mwangi Tea Estate', ARRAY['Tea', 'Maize'], 6.9),
('550e8400-e29b-41d4-a716-446655440008', 'Ruth Akinyi', '+254789012345', 'Homa Bay', 'Rachuonyo South', 'Oyugis', 'Akinyi Fish Farm', ARRAY['Fish', 'Vegetables'], 1.5);

-- Insert registered sensors
INSERT INTO public.registered_sensors (id, user_id, name, ip_address, sensor_type, location_zone, status, last_ping) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Soil Moisture Sensor A1', '192.168.1.101', 'soil_moisture', 'Zone A', 'online', NOW() - INTERVAL '5 minutes'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Temperature Sensor B1', '192.168.1.102', 'temperature', 'Zone B', 'online', NOW() - INTERVAL '2 minutes'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Humidity Sensor C1', '192.168.1.103', 'humidity', 'Greenhouse 1', 'online', NOW() - INTERVAL '1 minute'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'pH Sensor D1', '192.168.1.104', 'ph', 'Field 1', 'online', NOW() - INTERVAL '10 minutes'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Light Sensor E1', '192.168.1.105', 'light_intensity', 'Garden', 'offline', NOW() - INTERVAL '2 hours'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'Nutrient Sensor F1', '192.168.1.106', 'nutrients', 'Main Field', 'online', NOW() - INTERVAL '15 minutes'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440006', 'Weather Station G1', '192.168.1.107', 'weather', 'Central', 'online', NOW() - INTERVAL '3 minutes'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440007', 'Water Level Sensor H1', '192.168.1.108', 'water_level', 'Tank 1', 'online', NOW() - INTERVAL '7 minutes');

-- Insert sensor data (recent readings)
INSERT INTO public.sensor_data (user_id, sensor_type, value, unit, location_zone, created_at) VALUES
-- Today's data
('550e8400-e29b-41d4-a716-446655440001', 'soil_moisture', 65.5, '%', 'Zone A', NOW() - INTERVAL '5 minutes'),
('550e8400-e29b-41d4-a716-446655440001', 'temperature', 24.8, '°C', 'Zone B', NOW() - INTERVAL '5 minutes'),
('550e8400-e29b-41d4-a716-446655440002', 'humidity', 78.2, '%', 'Greenhouse 1', NOW() - INTERVAL '3 minutes'),
('550e8400-e29b-41d4-a716-446655440003', 'ph', 6.8, 'pH', 'Field 1', NOW() - INTERVAL '10 minutes'),
('550e8400-e29b-41d4-a716-446655440004', 'light_intensity', 45000, 'lux', 'Garden', NOW() - INTERVAL '15 minutes'),
('550e8400-e29b-41d4-a716-446655440005', 'nutrients', 450, 'ppm', 'Main Field', NOW() - INTERVAL '20 minutes'),
('550e8400-e29b-41d4-a716-446655440006', 'temperature', 22.1, '°C', 'Central', NOW() - INTERVAL '25 minutes'),
('550e8400-e29b-41d4-a716-446655440007', 'water_level', 85.6, '%', 'Tank 1', NOW() - INTERVAL '30 minutes'),
-- Yesterday's data
('550e8400-e29b-41d4-a716-446655440001', 'soil_moisture', 62.3, '%', 'Zone A', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', 'temperature', 26.2, '°C', 'Zone B', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 'humidity', 82.1, '%', 'Greenhouse 1', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440003', 'ph', 6.9, 'pH', 'Field 1', NOW() - INTERVAL '1 day'),
-- Last week's data
('550e8400-e29b-41d4-a716-446655440001', 'soil_moisture', 58.7, '%', 'Zone A', NOW() - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440002', 'temperature', 28.5, '°C', 'Zone B', NOW() - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440003', 'humidity', 75.4, '%', 'Greenhouse 1', NOW() - INTERVAL '7 days');

-- Insert irrigation logs
INSERT INTO public.irrigation_logs (user_id, zone, duration_minutes, water_amount_liters, soil_moisture_before, soil_moisture_after, temperature, humidity, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Zone A', 45, 150.5, 55.2, 65.8, 24.5, 68.3, NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440001', 'Zone B', 30, 120.0, 48.1, 62.4, 25.1, 71.2, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 'Greenhouse 1', 25, 85.2, 60.5, 75.8, 22.8, 85.1, NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440003', 'Field 1', 60, 245.7, 42.3, 68.9, 26.2, 62.4, NOW() - INTERVAL '6 hours'),
('550e8400-e29b-41d4-a716-446655440004', 'Garden', 20, 65.3, 52.1, 71.5, 23.7, 74.8, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440005', 'Main Field', 90, 380.2, 38.6, 72.3, 27.1, 59.7, NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440006', 'Central', 35, 125.8, 45.8, 69.2, 24.9, 66.5, NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440007', 'Tank 1', 40, 145.6, 51.2, 74.1, 25.8, 72.3, NOW() - INTERVAL '4 days');

-- Insert vendors
INSERT INTO public.vendors (id, name, contact_phone, contact_email, location, specialization, rating) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'AgriSupply Kenya Ltd', '+254720123456', 'info@agrisupply.co.ke', 'Nairobi', ARRAY['Seeds', 'Fertilizers', 'Pesticides'], 4.8),
('770e8400-e29b-41d4-a716-446655440002', 'Green Valley Supplies', '+254731234567', 'sales@greenvalley.co.ke', 'Nakuru', ARRAY['Irrigation Equipment', 'Tools'], 4.6),
('770e8400-e29b-41d4-a716-446655440003', 'Farm Tech Solutions', '+254742345678', 'orders@farmtech.co.ke', 'Eldoret', ARRAY['Sensors', 'Technology'], 4.9),
('770e8400-e29b-41d4-a716-446655440004', 'Organic Inputs Co', '+254753456789', 'info@organicinputs.co.ke', 'Meru', ARRAY['Organic Fertilizers', 'Seeds'], 4.7),
('770e8400-e29b-41d4-a716-446655440005', 'Livestock Feeds Ltd', '+254764567890', 'sales@livestockfeeds.co.ke', 'Kiambu', ARRAY['Animal Feed', 'Supplements'], 4.5);

-- Insert vendor products
INSERT INTO public.vendor_products (id, vendor_id, product_name, category, price, stock_quantity, unit, description, image_url) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Hybrid Maize Seeds KDV1', 'Seeds', 850.00, 500, 'kg', 'High yield drought resistant maize variety', '/placeholder.svg'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'NPK Fertilizer 17-17-17', 'Fertilizers', 4200.00, 200, '50kg bag', 'Balanced NPK fertilizer for general crops', '/placeholder.svg'),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'Drip Irrigation Kit', 'Irrigation', 15500.00, 50, 'set', 'Complete drip irrigation system for 1 acre', '/placeholder.svg'),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 'Garden Hose 30m', 'Tools', 2800.00, 75, 'piece', 'Heavy duty garden hose with fittings', '/placeholder.svg'),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440003', 'Soil Moisture Sensor Pro', 'Technology', 8900.00, 25, 'piece', 'Advanced wireless soil moisture monitoring', '/placeholder.svg'),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440003', 'Weather Station Deluxe', 'Technology', 25000.00, 10, 'piece', 'Complete weather monitoring station', '/placeholder.svg'),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440004', 'Organic Compost', 'Fertilizers', 1200.00, 300, '20kg bag', 'Premium organic compost manure', '/placeholder.svg'),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440005', 'Dairy Cow Feed', 'Animal Feed', 3500.00, 150, '70kg bag', 'High protein feed for dairy cattle', '/placeholder.svg');

-- Insert orders
INSERT INTO public.orders (id, user_id, vendor_id, product_id, quantity, total_amount, status, delivery_address, order_notes, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 2, 1700.00, 'delivered', 'Kamau Family Farm, Riabai Ward, Kiambu', 'Urgent delivery needed', NOW() - INTERVAL '3 days'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 1, 15500.00, 'pending', 'Wanjiku Greenhouse, Biashara Ward, Nakuru', 'Install at greenhouse location', NOW() - INTERVAL '1 day'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440005', 3, 26700.00, 'shipped', 'Ochieng Rice Farm, Kondele Ward, Kisumu', 'Multiple sensor installation', NOW() - INTERVAL '2 days'),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440007', 5, 6000.00, 'delivered', 'Mutindi Organic Farm, Kalama Ward, Machakos', 'For organic vegetable production', NOW() - INTERVAL '5 days'),
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440008', 2, 7000.00, 'pending', 'Kipkorir Dairy Farm, Kapsoya Ward, Eldoret', 'Monthly feed supply', NOW() - INTERVAL '12 hours');

-- Insert support tickets
INSERT INTO public.support_tickets (id, user_id, subject, message, priority, status, created_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sensor not connecting', 'My soil moisture sensor stopped sending data since yesterday. Please help troubleshoot.', 'high', 'open', NOW() - INTERVAL '6 hours'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Irrigation schedule adjustment', 'Need help setting up automatic irrigation for my greenhouse tomatoes.', 'medium', 'in_progress', NOW() - INTERVAL '1 day'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Weather data accuracy', 'The weather forecast seems incorrect for my location. Getting conflicting data.', 'low', 'resolved', NOW() - INTERVAL '3 days'),
('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Account profile update', 'Cannot update my farm size and crop information in the profile section.', 'medium', 'open', NOW() - INTERVAL '2 days'),
('aa0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Mobile app sync issues', 'Data not syncing between web and mobile app versions.', 'high', 'in_progress', NOW() - INTERVAL '4 hours');

-- Insert daily reports
INSERT INTO public.daily_reports (id, user_id, report_date, irrigation_summary, weather_summary, sensor_summary, crop_suggestions, recommendations, created_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 
'{"total_water_used": 270.5, "irrigation_cycles": 2, "zones_irrigated": ["Zone A", "Zone B"], "efficiency_score": 85}'::jsonb,
'{"avg_temperature": 24.8, "humidity": 68.3, "rainfall": 0, "wind_speed": 12.5, "conditions": "Sunny"}'::jsonb,
'{"soil_moisture_avg": 63.7, "ph_level": 6.8, "nutrient_status": "Good", "sensors_online": 7}'::jsonb,
ARRAY['Consider planting short-season varieties', 'Increase irrigation frequency'], 
ARRAY['Monitor soil moisture levels closely', 'Apply organic fertilizer next week'], NOW()),

('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day',
'{"total_water_used": 85.2, "irrigation_cycles": 1, "zones_irrigated": ["Greenhouse 1"], "efficiency_score": 92}'::jsonb,
'{"avg_temperature": 22.8, "humidity": 85.1, "rainfall": 2.5, "wind_speed": 8.2, "conditions": "Partly Cloudy"}'::jsonb,
'{"soil_moisture_avg": 75.8, "ph_level": 6.7, "nutrient_status": "Excellent", "sensors_online": 1}'::jsonb,
ARRAY['Tomatoes ready for harvest in 2 weeks', 'Consider succession planting'],
ARRAY['Reduce irrigation due to recent rainfall', 'Monitor for fungal diseases'], NOW() - INTERVAL '1 day');

-- Insert Kenyan locations data
INSERT INTO public.kenyan_locations (county, sub_county, ward, latitude, longitude) VALUES
('Kiambu', 'Kiambu East', 'Riabai', -1.1710, 36.8340),
('Nakuru', 'Nakuru East', 'Biashara', -0.3031, 36.0800),
('Kisumu', 'Kisumu Central', 'Kondele', -0.0917, 34.7680),
('Machakos', 'Machakos', 'Kalama', -1.5177, 37.2634),
('Uasin Gishu', 'Eldoret East', 'Kapsoya', 0.5143, 35.2700),
('Meru', 'Imenti North', 'Kiirua', 0.0465, 37.6500),
('Murang''a', 'Kiharu', 'Gaturi', -0.7179, 37.1500),
('Homa Bay', 'Rachuonyo South', 'Oyugis', -0.5103, 34.7297);

-- Add admin role for demo admin
INSERT INTO public.admin_roles (user_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440008', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;