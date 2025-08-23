-- Complete Database Schema for Drop of Hope
-- Run this in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (unified user table)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  profile_pic_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('donor', 'admin', 'hospital')) DEFAULT 'donor',
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT false,
  last_donation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Donors table (for Clerk integration)
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  profile_pic_url TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT false,
  last_donation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  profile_pic_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Hospital Staff table
CREATE TABLE IF NOT EXISTS hospital_staff (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  hospital_id UUID,
  department TEXT,
  position TEXT,
  profile_pic_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  license_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Blood Drives table
CREATE TABLE IF NOT EXISTS drives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL,
  hospital_id UUID,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  blood_types_needed TEXT[] DEFAULT '{}',
  capacity INTEGER NOT NULL,
  registered_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 7. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL,
  drive_id UUID NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (drive_id) REFERENCES drives(id)
);

-- 8. Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL,
  drive_id UUID,
  hospital_id UUID,
  donation_date DATE NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  quantity_ml INTEGER,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'deferred', 'cancelled')),
  points_earned INTEGER DEFAULT 0,
  hemoglobin_level DECIMAL(4,2),
  blood_pressure TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (drive_id) REFERENCES drives(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 9. Blood Requests table
CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  quantity_units INTEGER NOT NULL,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  needed_by DATE NOT NULL,
  reason TEXT,
  fulfilled_units INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 10. Blood Inventory table
CREATE TABLE IF NOT EXISTS blood_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_available INTEGER NOT NULL DEFAULT 0,
  units_reserved INTEGER DEFAULT 0,
  expiry_date DATE NOT NULL,
  donation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (donation_id) REFERENCES donations(id)
);

-- 11. Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  points_threshold INTEGER NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  priority TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Community Comments table
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
);

-- 15. Community Likes table
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donors_clerk_user_id ON donors(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_drives_start_date ON drives(start_date);
CREATE INDEX IF NOT EXISTS idx_appointments_donor_id ON appointments(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_id ON blood_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_hospital_id ON blood_inventory(hospital_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);

-- Add foreign key constraint for hospital_staff
ALTER TABLE hospital_staff ADD CONSTRAINT fk_hospital_staff_hospital 
FOREIGN KEY (hospital_id) REFERENCES hospitals(id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may want to customize these based on your security requirements)

-- Donors table policies
CREATE POLICY "Donors can view own profile" ON donors FOR SELECT USING (auth.uid()::text = clerk_user_id);
CREATE POLICY "Donors can update own profile" ON donors FOR UPDATE USING (auth.uid()::text = clerk_user_id);
CREATE POLICY "Anyone can insert donor profile" ON donors FOR INSERT WITH CHECK (true);

-- Public read access for certain tables (adjust as needed)
CREATE POLICY "Public read access" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Public read access" ON drives FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON blood_requests FOR SELECT USING (true);

-- Admin full access (you'll need to implement proper admin role checking)
CREATE POLICY "Admin full access" ON profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- More specific policies should be added based on your application's security requirements

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to tables that have updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospital_staff_updated_at BEFORE UPDATE ON hospital_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drives_updated_at BEFORE UPDATE ON drives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON blood_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blood_inventory_updated_at BEFORE UPDATE ON blood_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
