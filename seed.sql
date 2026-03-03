DO $$ 
DECLARE 
  i INTEGER;
  user_ids UUID[];
  hospital_ids UUID[];
  drive_ids UUID[];
  donor_ids UUID[];
  donation_ids UUID[];
  post_ids UUID[];
  admin_ids UUID[];
  blood_types TEXT[] := ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  clerk_id_base TEXT := 'user_2mXXXXXX';
  new_user_uuid UUID;
  new_hospital_uuid UUID;
  new_donor_uuid UUID;
  new_drive_uuid UUID;
  new_donation_uuid UUID;
  new_post_uuid UUID;
BEGIN
  -- 1. Create 20 auth.users
  FOR i IN 1..20 LOOP
    new_user_uuid := gen_random_uuid();
    user_ids := array_append(user_ids, new_user_uuid);
    
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      new_user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dummy.user' || i || '@example.com', 'hashed_pw', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, ('{"name":"Dummy User ' || i || '"}')::jsonb, '', '', '', ''
    );
  END LOOP;

  -- Update profiles created by trigger
  UPDATE public.profiles SET 
    phone = '1234567890',
    blood_type = blood_types[(floor(random() * 8 + 1))::int]::blood_type,
    city = 'Dummy City',
    state = 'Dummy State',
    points = 100,
    is_verified = true
  WHERE email LIKE 'dummy.user%@example.com';

  -- 2. Create 20 admins
  FOR i IN 1..20 LOOP
    INSERT INTO public.admins (email, password, name, phone, is_verified)
    VALUES ('admin' || i || '@example.com', 'secure_pw', 'Admin ' || i, '1234567890', true);
  END LOOP;

  -- 3. Create 20 donors
  FOR i IN 1..20 LOOP
    new_donor_uuid := gen_random_uuid();
    donor_ids := array_append(donor_ids, new_donor_uuid);
    
    INSERT INTO public.donors (
      id, clerk_user_id, email, name, phone, blood_type, city, state, points, is_verified
    ) VALUES (
      new_donor_uuid, clerk_id_base || i, 'donor' || i || '@example.com', 'Donor ' || i, '1234567890', blood_types[(i % 8) + 1], 'City ' || i, 'State ' || i, i * 10, true
    );
  END LOOP;

  -- 4. Create 20 hospitals
  FOR i IN 1..20 LOOP
    new_hospital_uuid := gen_random_uuid();
    hospital_ids := array_append(hospital_ids, new_hospital_uuid);
    
    INSERT INTO public.hospitals (
      id, name, address, city, state, phone, email, contact_person, created_by, is_verified
    ) VALUES (
      new_hospital_uuid, 'Hospital ' || i, i || ' Main St', 'City ' || i, 'State ' || i, '123-456-7890', 'hospital' || i || '@example.com', 'Dr. Smith ' || i, user_ids[i], true
    );
  END LOOP;

  -- 5. Create 20 hospital_staff
  FOR i IN 1..20 LOOP
    INSERT INTO public.hospital_staff (
      hospital_id, name, email, phone, department, position, is_verified
    ) VALUES (
      hospital_ids[i], 'Staff ' || i, 'staff' || i || '@example.com', '123-456-7890', 'Emergency', 'Nurse', true
    );
  END LOOP;

  -- 6. Create 20 drives
  FOR i IN 1..20 LOOP
    new_drive_uuid := gen_random_uuid();
    drive_ids := array_append(drive_ids, new_drive_uuid);
    
    INSERT INTO public.drives (
      id, name, description, hospital_id, organizer_id, location, address, city, state, start_date, end_date, start_time, end_time, capacity, is_active
    ) VALUES (
      new_drive_uuid, 'Blood Drive ' || i, 'Annual drive in City ' || i, hospital_ids[i], user_ids[i], 'Community Center ' || i, i || ' Center Rd', 'City ' || i, 'State ' || i, CURRENT_DATE + (i || ' days')::INTERVAL, CURRENT_DATE + ((i+1) || ' days')::INTERVAL, '09:00:00', '17:00:00', 50, true
    );
  END LOOP;

  -- 7. Create 20 appointments
  FOR i IN 1..20 LOOP
    INSERT INTO public.appointments (
      donor_id, drive_id, appointment_date, appointment_time, notes, status
    ) VALUES (
      donor_ids[i], drive_ids[i], CURRENT_DATE + (i || ' days')::INTERVAL, '10:00:00', 'No notes', 'scheduled'::appointment_status
    );
  END LOOP;

  -- 8. Create 20 donations
  FOR i IN 1..20 LOOP
    new_donation_uuid := gen_random_uuid();
    donation_ids := array_append(donation_ids, new_donation_uuid);
    
    INSERT INTO public.donations (
      id, donor_id, drive_id, hospital_id, donation_date, blood_type, quantity_ml, status, points_earned
    ) VALUES (
      new_donation_uuid, user_ids[i], drive_ids[i], hospital_ids[i], CURRENT_DATE - (i || ' days')::INTERVAL, blood_types[(i % 8) + 1]::blood_type, 450, 'completed'::donation_status, 10
    );
  END LOOP;

  -- 9. Create 20 blood_requests
  FOR i IN 1..20 LOOP
    INSERT INTO public.blood_requests (
      hospital_id, blood_type, quantity_units, needed_by, reason, urgency, status
    ) VALUES (
      hospital_ids[i], blood_types[(i % 8) + 1]::blood_type, 10, CURRENT_DATE + (10 - i || ' days')::INTERVAL, 'Accident emergency', 'high'::request_urgency, 'pending'::request_status
    );
  END LOOP;

  -- 10. Create 20 blood_inventory
  FOR i IN 1..20 LOOP
    INSERT INTO public.blood_inventory (
      hospital_id, donation_id, blood_type, expiry_date, units_available, units_reserved
    ) VALUES (
      hospital_ids[i], donation_ids[i], blood_types[(i % 8) + 1]::blood_type, CURRENT_DATE + 35, 1, 0
    );
  END LOOP;

  -- 11. Create 20 rewards
  FOR i IN 1..20 LOOP
    INSERT INTO public.rewards (
      donor_id, badge_name, badge_description, points_threshold
    ) VALUES (
      user_ids[i], 'Level ' || i || ' Contributor', 'Awarded for reaching level ' || i, i * 10
    );
  END LOOP;

  -- 12. Create 20 community_posts
  FOR i IN 1..20 LOOP
    new_post_uuid := gen_random_uuid();
    post_ids := array_append(post_ids, new_post_uuid);
    
    INSERT INTO public.community_posts (
      id, author_id, content, likes_count, comments_count
    ) VALUES (
      new_post_uuid, user_ids[i], 'This is a sample community post number ' || i, i * 2, i + 1
    );
  END LOOP;

  -- 13. Create 20 community_comments
  FOR i IN 1..20 LOOP
    INSERT INTO public.community_comments (
      post_id, author_id, content
    ) VALUES (
      post_ids[1 + (i % 20)], user_ids[20 - i + 1], 'This is a comment on post ' || (1 + (i % 20)) || ' by user ' || (20 - i + 1)
    );
  END LOOP;

  -- 14. Create 20 community_likes
  FOR i IN 1..20 LOOP
    INSERT INTO public.community_likes (
      post_id, user_id
    ) VALUES (
      post_ids[1 + (i % 20)], user_ids[20 - i + 1]
    );
  END LOOP;

  -- 15. Create 20 notifications
  FOR i IN 1..20 LOOP
    INSERT INTO public.notifications (
      user_id, title, message, type, is_read
    ) VALUES (
      user_ids[i], 'Notification ' || i, 'You have a new message ' || i, 'info', false
    );
  END LOOP;

  -- 16. Create 20 tasks
  FOR i IN 1..20 LOOP
    INSERT INTO public.tasks (
      name, user_id
    ) VALUES (
      'Task ' || i, user_ids[i]::text
    );
  END LOOP;

END $$;
