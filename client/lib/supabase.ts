import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface Profile {
  id: string
  email: string
  name: string
  phone?: string
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  profile_pic_url?: string
  role: 'donor' | 'admin' | 'hospital'
  points?: number
  level?: number
  is_verified?: boolean
  last_donation_date?: string
  created_at?: string
  updated_at?: string
}

export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  state: string
  postal_code?: string
  phone: string
  email: string
  contact_person: string
  license_number?: string
  is_verified?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Drive {
  id: string
  name: string
  description?: string
  organizer_id: string
  hospital_id?: string
  location: string
  address: string
  city: string
  state: string
  postal_code?: string
  latitude?: number
  longitude?: number
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  blood_types_needed?: string[]
  capacity: number
  registered_count?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Appointment {
  id: string
  donor_id: string
  drive_id: string
  appointment_date: string
  appointment_time: string
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface Donation {
  id: string
  donor_id: string
  drive_id?: string
  hospital_id?: string
  donation_date: string
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  quantity_ml?: number
  status?: 'scheduled' | 'completed' | 'deferred' | 'cancelled'
  points_earned?: number
  hemoglobin_level?: number
  blood_pressure?: string
  notes?: string
  created_at?: string
}

export interface BloodRequest {
  id: string
  hospital_id: string
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  quantity_units: number
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'pending' | 'fulfilled' | 'cancelled'
  needed_by: string
  reason?: string
  fulfilled_units?: number
  created_at?: string
  updated_at?: string
}

export interface Reward {
  id: string
  donor_id: string
  badge_name: string
  badge_description?: string
  badge_icon?: string
  points_threshold: number
  earned_at?: string
}

export interface CommunityPost {
  id: string
  author_id: string
  content: string
  image_url?: string
  likes_count?: number
  comments_count?: number
  is_pinned?: boolean
  created_at?: string
  updated_at?: string
}
