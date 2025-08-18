-- Manual Database Setup Script for Drop of Hope
-- Run these commands in your Supabase SQL Editor

-- 1. Insert test admin users into profiles table
INSERT INTO profiles (
  id, email, name, role, points, level, is_verified, created_at, updated_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'admin@dropofhope.com',
  'System Administrator',
  'admin',
  0,
  1,
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'sarah.admin@dropofhope.com',
  'Sarah Johnson',
  'admin',
  0,
  1,
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'michael.admin@dropofhope.com',
  'Michael Chen',
  'admin',
  0,
  1,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert test hospital staff users into profiles table
INSERT INTO profiles (
  id, email, name, role, points, level, is_verified, created_at, updated_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440011',
  'staff@cityhospital.com',
  'Dr. Emily Davis',
  'hospital',
  0,
  1,
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  'coordinator@metromedical.com',
  'James Wilson',
  'hospital',
  0,
  1,
  true,
  now(),
  now()
),
(
  '550e8400-e29b-41d4-a716-446655440013',
  'bloodbank@communityhc.com',
  'Dr. Lisa Rodriguez',
  'hospital',
  0,
  1,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert additional hospital records
INSERT INTO hospitals (
  id, name, address, city, state, postal_code, phone, email, 
  contact_person, license_number, is_verified, created_by
) VALUES
(
  '550e8400-e29b-41d4-a716-446655441001',
  'City General Hospital',
  '123 Healthcare Ave',
  'New York',
  'NY',
  '10001',
  '(555) 123-4567',
  'info@citygeneral.com',
  'Dr. Emily Davis',
  'LIC001234',
  true,
  '550e8400-e29b-41d4-a716-446655440011'
),
(
  '550e8400-e29b-41d4-a716-446655441002',
  'Metro Medical Center',
  '456 Medical Blvd',
  'Los Angeles',
  'CA',
  '90210',
  '(555) 234-5678',
  'contact@metromedical.com',
  'James Wilson',
  'LIC005678',
  true,
  '550e8400-e29b-41d4-a716-446655440012'
),
(
  '550e8400-e29b-41d4-a716-446655441003',
  'Community Health Center',
  '789 Wellness St',
  'Chicago',
  'IL',
  '60601',
  '(555) 345-6789',
  'admin@communityhc.com',
  'Dr. Lisa Rodriguez',
  'LIC009876',
  true,
  '550e8400-e29b-41d4-a716-446655440013'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Add some sample blood inventory data
INSERT INTO blood_inventory (
  hospital_id, blood_type, units_available, units_reserved, expiry_date
) VALUES
-- City General Hospital inventory
('550e8400-e29b-41d4-a716-446655441001', 'O+', 15, 2, current_date + interval '30 days'),
('550e8400-e29b-41d4-a716-446655441001', 'O-', 8, 1, current_date + interval '25 days'),
('550e8400-e29b-41d4-a716-446655441001', 'A+', 12, 3, current_date + interval '28 days'),
('550e8400-e29b-41d4-a716-446655441001', 'A-', 6, 0, current_date + interval '20 days'),
('550e8400-e29b-41d4-a716-446655441001', 'B+', 9, 1, current_date + interval '35 days'),
('550e8400-e29b-41d4-a716-446655441001', 'B-', 4, 0, current_date + interval '15 days'),
('550e8400-e29b-41d4-a716-446655441001', 'AB+', 7, 1, current_date + interval '22 days'),
('550e8400-e29b-41d4-a716-446655441001', 'AB-', 3, 0, current_date + interval '18 days'),

-- Metro Medical Center inventory
('550e8400-e29b-41d4-a716-446655441002', 'O+', 20, 4, current_date + interval '32 days'),
('550e8400-e29b-41d4-a716-446655441002', 'O-', 12, 2, current_date + interval '27 days'),
('550e8400-e29b-41d4-a716-446655441002', 'A+', 18, 5, current_date + interval '29 days'),
('550e8400-e29b-41d4-a716-446655441002', 'A-', 10, 1, current_date + interval '24 days'),
('550e8400-e29b-41d4-a716-446655441002', 'B+', 14, 2, current_date + interval '31 days'),
('550e8400-e29b-41d4-a716-446655441002', 'B-', 8, 1, current_date + interval '26 days'),
('550e8400-e29b-41d4-a716-446655441002', 'AB+', 11, 2, current_date + interval '33 days'),
('550e8400-e29b-41d4-a716-446655441002', 'AB-', 5, 0, current_date + interval '19 days'),

-- Community Health Center inventory
('550e8400-e29b-41d4-a716-446655441003', 'O+', 25, 3, current_date + interval '28 days'),
('550e8400-e29b-41d4-a716-446655441003', 'O-', 15, 2, current_date + interval '23 days'),
('550e8400-e29b-41d4-a716-446655441003', 'A+', 22, 4, current_date + interval '30 days'),
('550e8400-e29b-41d4-a716-446655441003', 'A-', 13, 1, current_date + interval '25 days'),
('550e8400-e29b-41d4-a716-446655441003', 'B+', 16, 2, current_date + interval '34 days'),
('550e8400-e29b-41d4-a716-446655441003', 'B-', 9, 1, current_date + interval '21 days'),
('550e8400-e29b-41d4-a716-446655441003', 'AB+', 12, 1, current_date + interval '27 days'),
('550e8400-e29b-41d4-a716-446655441003', 'AB-', 6, 0, current_date + interval '16 days');

-- 5. Add some sample blood requests
INSERT INTO blood_requests (
  hospital_id, blood_type, quantity_units, urgency, status, needed_by, reason
) VALUES
(
  '550e8400-e29b-41d4-a716-446655441001',
  'O-',
  5,
  'critical',
  'pending',
  current_date + interval '2 days',
  'Emergency surgery patient'
),
(
  '550e8400-e29b-41d4-a716-446655441002',
  'A+',
  8,
  'high',
  'pending',
  current_date + interval '5 days',
  'Cancer treatment support'
),
(
  '550e8400-e29b-41d4-a716-446655441003',
  'B-',
  3,
  'medium',
  'pending',
  current_date + interval '7 days',
  'Regular inventory replenishment'
);

-- 6. Verify the data was inserted correctly
SELECT 'Admin Users' as category, count(*) as count FROM profiles WHERE role = 'admin'
UNION ALL
SELECT 'Hospital Staff' as category, count(*) as count FROM profiles WHERE role = 'hospital'
UNION ALL
SELECT 'Hospital Records' as category, count(*) as count FROM hospitals
UNION ALL
SELECT 'Blood Inventory' as category, count(*) as count FROM blood_inventory
UNION ALL
SELECT 'Blood Requests' as category, count(*) as count FROM blood_requests;
