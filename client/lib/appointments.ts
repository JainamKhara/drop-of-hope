// Frontend-only appointment storage using localStorage

export interface Appointment {
  id: string;
  driveId: string;
  driveName: string;
  organizer: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  location: string;
  address: string;
  city?: string;
  state?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  bloodType?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "drop_of_hope_appointments";

// Get all appointments from localStorage
export const getAppointments = (): Appointment[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading appointments from localStorage:", error);
    return [];
  }
};

// Save an appointment to localStorage
export const saveAppointment = (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Appointment => {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  appointments.push(newAppointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  return newAppointment;
};

// Update an appointment
export const updateAppointment = (id: string, updates: Partial<Appointment>): Appointment | null => {
  const appointments = getAppointments();
  const index = appointments.findIndex((apt) => apt.id === id);
  
  if (index === -1) return null;
  
  appointments[index] = {
    ...appointments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  return appointments[index];
};

// Delete an appointment
export const deleteAppointment = (id: string): boolean => {
  const appointments = getAppointments();
  const filtered = appointments.filter((apt) => apt.id !== id);
  
  if (filtered.length === appointments.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Get appointments by donor email (for filtering)
export const getAppointmentsByDonor = (donorEmail: string): Appointment[] => {
  return getAppointments().filter((apt) => apt.donorEmail === donorEmail);
};
