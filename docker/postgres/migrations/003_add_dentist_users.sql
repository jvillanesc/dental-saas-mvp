-- Migration 003: Add unique user accounts for each dentist
-- Required for appointment modal dentist assignment to work correctly
-- Previously all dentists shared dentist@dentalcare.com

-- Create individual user accounts for each dentist
INSERT INTO users (id, tenant_id, email, password, role, created_at, updated_at)
VALUES 
  ('d1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', 
   'elena@dentalcare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
   'DENTIST', NOW(), NOW()),
  
  ('d2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', 
   'ricardo@dentalcare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
   'DENTIST', NOW(), NOW()),
  
  ('d3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', 
   'carmen@dentalcare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
   'DENTIST', NOW(), NOW()),
  
  ('d4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', 
   'roberto@dentalcare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
   'DENTIST', NOW(), NOW());

-- Update staff records to reference individual user accounts
UPDATE staff 
SET user_id = 'd1111111-1111-1111-1111-111111111111' 
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE staff 
SET user_id = 'd2222222-2222-2222-2222-222222222222' 
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE staff 
SET user_id = 'd3333333-3333-3333-3333-333333333333' 
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE staff 
SET user_id = 'd4444444-4444-4444-4444-444444444444' 
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Note: Password for all accounts is "password123" (hashed with BCrypt)
-- Credentials:
--   elena@dentalcare.com / password123
--   ricardo@dentalcare.com / password123
--   carmen@dentalcare.com / password123
--   roberto@dentalcare.com / password123
