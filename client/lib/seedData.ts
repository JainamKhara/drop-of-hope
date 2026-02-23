import { supabase } from "./supabase";

// Test data for admin and hospital users
export const seedTestData = async () => {
  try {
    // Test admin users
    const adminUsers = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "admin@dropofhope.com",
        name: "System Administrator",
        password: "admin123", // Adding password field
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        email: "sarah.admin@dropofhope.com",
        name: "Sarah Johnson",
        password: "admin123", // Adding password field
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        email: "michael.admin@dropofhope.com",
        name: "Michael Chen",
        password: "admin123", // Adding password field
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Test donor users
    const donorUsers = [
      {
        clerk_user_id: "clerk_user_001",
        email: "john.donor@example.com",
        name: "John Smith",
        phone: "+1-555-0123",
        blood_type: "O+",
        city: "New York",
        state: "NY",
        points: 150,
        level: 2,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        clerk_user_id: "clerk_user_002",
        email: "sarah.donor@example.com",
        name: "Sarah Johnson",
        phone: "+1-555-0124",
        blood_type: "A-",
        city: "Los Angeles",
        state: "CA",
        points: 75,
        level: 1,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        clerk_user_id: "clerk_user_003",
        email: "mike.donor@example.com",
        name: "Mike Wilson",
        phone: "+1-555-0125",
        blood_type: "B+",
        city: "Chicago",
        state: "IL",
        points: 200,
        level: 3,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Test hospitals
    const hospitals = [
      {
        id: "550e8400-e29b-41d4-a716-446655441001",
        name: "City General Hospital",
        address: "123 Healthcare Ave",
        city: "New York",
        state: "NY",
        postal_code: "10001",
        phone: "(555) 123-4567",
        email: "info@citygeneral.com",
        password: "hospital123", // Adding password field
        contact_person: "Dr. Emily Davis",
        license_number: "LIC001234",
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655441002",
        name: "Metro Medical Center",
        address: "456 Medical Blvd",
        city: "Los Angeles",
        state: "CA",
        postal_code: "90210",
        phone: "(555) 234-5678",
        email: "contact@metromedical.com",
        password: "hospital123", // Adding password field
        contact_person: "Dr. Michael Brown",
        license_number: "LIC005678",
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655441003",
        name: "Community Health Center",
        address: "789 Wellness St",
        city: "Chicago",
        state: "IL",
        postal_code: "60601",
        phone: "(555) 345-6789",
        email: "admin@communityhc.com",
        password: "hospital123", // Adding password field
        contact_person: "Dr. Lisa Rodriguez",
        license_number: "LIC009876",
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Insert data
    const { error: adminError } = await supabase
      .from("admins")
      .upsert(adminUsers, { onConflict: "id" });

    const { error: donorError } = await supabase
      .from("donors")
      .upsert(donorUsers, { onConflict: "clerk_user_id" });

    const { error: hospitalError } = await supabase
      .from("hospitals")
      .upsert(hospitals, { onConflict: "id" });

    if (adminError) throw adminError;
    if (donorError) throw donorError;
    if (hospitalError) throw hospitalError;

    return {
      success: true,
      message: "Test data seeded successfully!",
      details: {
        admins: adminUsers.length,
        donors: donorUsers.length,
        hospitals: hospitals.length,
      },
    };
  } catch (error) {
    console.error("Error seeding test data:", error);
    return {
      success: false,
      message: "Failed to seed test data",
      error: error,
    };
  }
};

export const testCredentials = {
  admin: [
    { email: "admin@dropofhope.com", password: "admin123" },
    { email: "sarah.admin@dropofhope.com", password: "admin123" },
    { email: "michael.admin@dropofhope.com", password: "admin123" },
  ],
  donor: [
    { email: "john.donor@example.com", password: "donor123" },
    { email: "sarah.donor@example.com", password: "donor123" },
    { email: "mike.donor@example.com", password: "donor123" },
  ],
  hospital: [
    { email: "info@citygeneral.com", password: "hospital123" },
    { email: "contact@metromedical.com", password: "hospital123" },
    { email: "admin@communityhc.com", password: "hospital123" },
  ],
};

// Note: We're no longer creating auth users, instead storing passwords directly in the tables
// The passwords are stored in the admin and hospital tables
