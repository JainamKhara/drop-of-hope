import { supabase } from "./supabase";

// Test data for admin and hospital users
export const seedTestData = async () => {
  try {
    console.log("Seeding test data...");

    // Test admin users data
    const adminUsers = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "admin@dropofhope.com",
        name: "System Administrator",
        role: "admin" as const,
        points: 0,
        level: 1,
        is_verified: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        email: "sarah.admin@dropofhope.com",
        name: "Sarah Johnson",
        role: "admin" as const,
        points: 0,
        level: 1,
        is_verified: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        email: "michael.admin@dropofhope.com",
        name: "Michael Chen",
        role: "admin" as const,
        points: 0,
        level: 1,
        is_verified: true,
      },
    ];

    // Test hospital staff users data
    const hospitalUsers = [
      {
        id: "550e8400-e29b-41d4-a716-446655440011",
        email: "staff@cityhospital.com",
        name: "Dr. Emily Davis",
        role: "hospital" as const,
        points: 0,
        level: 1,
        is_verified: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440012",
        email: "coordinator@metromedical.com",
        name: "James Wilson",
        role: "hospital" as const,
        points: 0,
        level: 1,
        is_verified: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440013",
        email: "bloodbank@communityhc.com",
        name: "Dr. Lisa Rodriguez",
        role: "hospital" as const,
        points: 0,
        level: 1,
        is_verified: true,
      },
    ];

    // Insert admin users
    for (const admin of adminUsers) {
      const { error } = await supabase
        .from("profiles")
        .upsert([admin], { onConflict: "id" });

      if (error) {
        console.error("Error inserting admin:", error);
      } else {
        console.log(`✅ Added admin: ${admin.name}`);
      }
    }

    // Insert hospital staff users
    for (const hospitalUser of hospitalUsers) {
      const { error } = await supabase
        .from("profiles")
        .upsert([hospitalUser], { onConflict: "id" });

      if (error) {
        console.error("Error inserting hospital user:", error);
      } else {
        console.log(`✅ Added hospital user: ${hospitalUser.name}`);
      }
    }

    // Additional hospitals data
    const hospitalsData = [
      {
        id: "550e8400-e29b-41d4-a716-446655441001",
        name: "City General Hospital",
        address: "123 Healthcare Ave",
        city: "New York",
        state: "NY",
        postal_code: "10001",
        phone: "(555) 123-4567",
        email: "info@citygeneral.com",
        contact_person: "Dr. Emily Davis",
        license_number: "LIC001234",
        is_verified: true,
        created_by: "550e8400-e29b-41d4-a716-446655440011",
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
        contact_person: "James Wilson",
        license_number: "LIC005678",
        is_verified: true,
        created_by: "550e8400-e29b-41d4-a716-446655440012",
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
        contact_person: "Dr. Lisa Rodriguez",
        license_number: "LIC009876",
        is_verified: true,
        created_by: "550e8400-e29b-41d4-a716-446655440013",
      },
    ];

    // Insert hospitals data
    for (const hospital of hospitalsData) {
      const { error } = await supabase
        .from("hospitals")
        .upsert([hospital], { onConflict: "id" });

      if (error) {
        console.error("Error inserting hospital:", error);
      } else {
        console.log(`✅ Added hospital: ${hospital.name}`);
      }
    }

    console.log("✅ Test data seeding completed!");
    return { success: true, message: "Test data added successfully" };
  } catch (error) {
    console.error("Error seeding data:", error);
    return { success: false, error };
  }
};

// Test user credentials for manual testing
export const testCredentials = {
  admin: [
    {
      email: "admin@dropofhope.com",
      password: "admin123",
      name: "System Administrator",
    },
    {
      email: "sarah.admin@dropofhope.com",
      password: "admin123",
      name: "Sarah Johnson",
    },
    {
      email: "michael.admin@dropofhope.com",
      password: "admin123",
      name: "Michael Chen",
    },
  ],
  hospital: [
    {
      email: "staff@cityhospital.com",
      password: "hospital123",
      name: "Dr. Emily Davis",
    },
    {
      email: "coordinator@metromedical.com",
      password: "hospital123",
      name: "James Wilson",
    },
    {
      email: "bloodbank@communityhc.com",
      password: "hospital123",
      name: "Dr. Lisa Rodriguez",
    },
  ],
  donor: [
    { email: "donor@example.com", password: "donor123", name: "John Donor" },
    {
      email: "mary.donor@example.com",
      password: "donor123",
      name: "Mary Smith",
    },
  ],
};

// Function to create auth users (requires proper Supabase setup)
export const createTestAuthUsers = async () => {
  const allUsers = [
    ...testCredentials.admin.map((u) => ({ ...u, role: "admin" })),
    ...testCredentials.hospital.map((u) => ({ ...u, role: "hospital" })),
    ...testCredentials.donor.map((u) => ({ ...u, role: "donor" })),
  ];

  for (const user of allUsers) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role,
          },
        },
      });

      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
      } else {
        console.log(`✅ Created auth user: ${user.name} (${user.role})`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
};
