
-- Insert test farming profiles
INSERT INTO public.profiles (id, full_name, phone_number, county, sub_county, ward, farm_name, crop_types, farm_size_acres) VALUES
(gen_random_uuid(), 'John Mwangi', '+254712345678', 'Kiambu', 'Thika', 'Gatuanyaga', 'Mwangi Coffee Farm', ARRAY['Coffee', 'Maize'], 15.5),
(gen_random_uuid(), 'Mary Wanjiku', '+254723456789', 'Nakuru', 'Nakuru East', 'Biashara', 'Wanjiku Dairy Farm', ARRAY['Dairy Farming', 'Napier Grass'], 25.0),
(gen_random_uuid(), 'Peter Kimani', '+254734567890', 'Meru', 'Imenti North', 'Municipality', 'Kimani Tea Estate', ARRAY['Tea', 'Bananas'], 40.2),
(gen_random_uuid(), 'Grace Achieng', '+254745678901', 'Kisumu', 'Kisumu East', 'Kolwa East', 'Achieng Fish Farm', ARRAY['Fish Farming', 'Rice'], 8.5),
(gen_random_uuid(), 'David Kiprop', '+254756789012', 'Uasin Gishu', 'Eldoret East', 'Kapsoya', 'Kiprop Wheat Farm', ARRAY['Wheat', 'Barley'], 120.0),
(gen_random_uuid(), 'Susan Njeri', '+254767890123', 'Nyeri', 'Nyeri Central', 'Rware', 'Njeri Horticulture', ARRAY['Tomatoes', 'Cabbages', 'Onions'], 12.3),
(gen_random_uuid(), 'James Ochieng', '+254778901234', 'Busia', 'Teso North', 'Malaba North', 'Ochieng Maize Farm', ARRAY['Maize', 'Beans'], 18.7),
(gen_random_uuid(), 'Faith Wambui', '+254789012345', 'Murang''a', 'Kandara', 'Ng''araria', 'Wambui Poultry Farm', ARRAY['Poultry', 'Kales'], 6.2),
(gen_random_uuid(), 'Samuel Rotich', '+254790123456', 'Kericho', 'Kipkelion East', 'Kedowa', 'Rotich Tea Plantation', ARRAY['Tea', 'Eucalyptus'], 85.5),
(gen_random_uuid(), 'Agnes Muthoni', '+254701234567', 'Embu', 'Mbeere North', 'Evurore', 'Muthoni Mango Farm', ARRAY['Mangoes', 'Avocados'], 22.1),
(gen_random_uuid(), 'Paul Wekesa', '+254712345679', 'Bungoma', 'Kanduyi', 'Bukembe East', 'Wekesa Sugarcane Farm', ARRAY['Sugarcane', 'Maize'], 35.8),
(gen_random_uuid(), 'Rose Nyawira', '+254723456780', 'Kirinyaga', 'Mwea', 'Wamumu', 'Nyawira Rice Scheme', ARRAY['Rice', 'Beans'], 28.4),
(gen_random_uuid(), 'Joseph Mutua', '+254734567881', 'Machakos', 'Machakos', 'Mutituni', 'Mutua Dryland Farm', ARRAY['Sorghum', 'Millet', 'Cowpeas'], 45.0),
(gen_random_uuid(), 'Elizabeth Chebet', '+254745678902', 'Nandi', 'Chesumei', 'Kaptel', 'Chebet Dairy Co-op', ARRAY['Dairy Farming', 'Maize'], 16.7),
(gen_random_uuid(), 'Michael Otieno', '+254756789013', 'Siaya', 'Gem', 'Yala Township', 'Otieno Mixed Farm', ARRAY['Cotton', 'Groundnuts'], 31.2),
(gen_random_uuid(), 'Joyce Wairimu', '+254767890124', 'Laikipia', 'Laikipia North', 'Mukogondo East', 'Wairimu Livestock Ranch', ARRAY['Beef Cattle', 'Sheep'], 200.5),
(gen_random_uuid(), 'Daniel Mbugua', '+254778901235', 'Nyandarua', 'Kipipiri', 'Wanjohi', 'Mbugua Potato Farm', ARRAY['Potatoes', 'Cabbages'], 19.8),
(gen_random_uuid(), 'Catherine Wanjala', '+254789012346', 'Kakamega', 'Lurambi', 'Butsotso East', 'Wanjala Vegetable Farm', ARRAY['Kales', 'Spinach', 'Carrots'], 9.5),
(gen_random_uuid(), 'Robert Koech', '+254790123457', 'Bomet', 'Sotik', 'Kipsonoi', 'Koech Coffee Estate', ARRAY['Coffee', 'Macadamia'], 52.3),
(gen_random_uuid(), 'Linda Akinyi', '+254701234568', 'Homa Bay', 'Rachuonyo North', 'West Gem', 'Akinyi Aquaculture', ARRAY['Tilapia', 'Catfish'], 4.8);

-- Insert irrigation logs for the test users
INSERT INTO public.irrigation_logs (user_id, zone, water_amount_liters, duration_minutes, soil_moisture_before, soil_moisture_after, temperature, humidity)
SELECT 
  p.id,
  CASE 
    WHEN random() < 0.3 THEN 'Zone A - Main Field'
    WHEN random() < 0.6 THEN 'Zone B - Greenhouse' 
    ELSE 'Zone C - Nursery'
  END,
  (random() * 500 + 100)::numeric, -- 100-600 liters
  (random() * 45 + 15)::integer, -- 15-60 minutes
  (random() * 30 + 20)::numeric, -- 20-50% moisture before
  (random() * 50 + 40)::numeric, -- 40-90% moisture after
  (random() * 15 + 18)::numeric, -- 18-33°C temperature
  (random() * 30 + 50)::numeric -- 50-80% humidity
FROM profiles p
CROSS JOIN generate_series(1, 5); -- 5 logs per user

-- Insert sensor data for monitoring
INSERT INTO public.sensor_data (user_id, sensor_type, value, unit, location_zone)
SELECT 
  p.id,
  sensor_types.type,
  CASE 
    WHEN sensor_types.type = 'soil_moisture' THEN (random() * 70 + 20)::numeric
    WHEN sensor_types.type = 'temperature' THEN (random() * 20 + 15)::numeric
    WHEN sensor_types.type = 'humidity' THEN (random() * 40 + 40)::numeric
    WHEN sensor_types.type = 'ph_level' THEN (random() * 4 + 5)::numeric
    ELSE (random() * 100)::numeric
  END,
  CASE 
    WHEN sensor_types.type = 'soil_moisture' THEN '%'
    WHEN sensor_types.type = 'temperature' THEN '°C'
    WHEN sensor_types.type = 'humidity' THEN '%'
    WHEN sensor_types.type = 'ph_level' THEN 'pH'
    ELSE 'units'
  END,
  CASE 
    WHEN random() < 0.4 THEN 'Main Field'
    WHEN random() < 0.7 THEN 'Greenhouse'
    ELSE 'Nursery'
  END
FROM profiles p
CROSS JOIN (
  VALUES 
    ('soil_moisture'),
    ('temperature'), 
    ('humidity'),
    ('ph_level'),
    ('light_intensity')
) AS sensor_types(type)
CROSS JOIN generate_series(1, 3); -- 3 readings per sensor type per user

-- Insert registered sensors
INSERT INTO public.registered_sensors (user_id, name, sensor_type, ip_address, location_zone, status)
SELECT 
  p.id,
  sensor_configs.name,
  sensor_configs.type,
  '192.168.' || (random() * 254 + 1)::integer || '.' || (random() * 254 + 1)::integer,
  sensor_configs.zone,
  CASE WHEN random() < 0.8 THEN 'online' ELSE 'offline' END
FROM profiles p
CROSS JOIN (
  VALUES 
    ('Soil Sensor 1', 'soil_moisture', 'Main Field'),
    ('Temp Monitor', 'temperature', 'Greenhouse'),
    ('Humidity Tracker', 'humidity', 'Nursery'),
    ('pH Meter', 'ph_level', 'Main Field')
) AS sensor_configs(name, type, zone)
LIMIT 60; -- Reasonable number of sensors

-- Insert support tickets
INSERT INTO public.support_tickets (user_id, subject, message, priority, status)
SELECT 
  p.id,
  ticket_data.subject,
  ticket_data.message,
  CASE WHEN random() < 0.2 THEN 'high' WHEN random() < 0.6 THEN 'medium' ELSE 'low' END,
  CASE WHEN random() < 0.3 THEN 'closed' WHEN random() < 0.7 THEN 'in_progress' ELSE 'open' END
FROM profiles p
CROSS JOIN (
  VALUES 
    ('Irrigation System Issue', 'My irrigation system is not working properly. Water flow seems reduced.'),
    ('Sensor Calibration Help', 'Need assistance with calibrating my soil moisture sensors.'),
    ('Weather Data Missing', 'Weather widget shows no data for my location.'),
    ('Report Generation Error', 'Unable to download my monthly farm report.'),
    ('Mobile App Sync', 'Data not syncing between web and mobile app.')
) AS ticket_data(subject, message)
LIMIT 40; -- Mix of tickets across users

-- Insert some vendor orders
INSERT INTO public.orders (user_id, product_id, vendor_id, quantity, total_amount, status, delivery_address)
SELECT 
  p.id,
  vp.id,
  vp.vendor_id,
  (random() * 10 + 1)::integer,
  (random() * 5000 + 500)::numeric,
  CASE 
    WHEN random() < 0.3 THEN 'delivered'
    WHEN random() < 0.6 THEN 'shipped'
    WHEN random() < 0.8 THEN 'processing'
    ELSE 'pending'
  END,
  p.county || ', ' || p.ward
FROM profiles p
CROSS JOIN vendor_products vp
WHERE random() < 0.1 -- Only 10% chance per combination
LIMIT 50;

-- Update some profiles with more recent activity
UPDATE profiles 
SET updated_at = now() - interval '1 day' * (random() * 30)
WHERE random() < 0.8;
