/**
 * Utility functions for calendar integration
 */

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Generates a Google Calendar URL for an event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  try {
    const formatToISO = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    // Ensure we have valid dates
    if (isNaN(event.startDate.getTime()) || isNaN(event.endDate.getTime())) {
      console.error("Invalid dates provided to generateGoogleCalendarUrl");
      return "#";
    }

    const startStr = formatToISO(event.startDate);
    const endStr = formatToISO(event.endDate);

    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  } catch (error) {
    console.error("Error generating Google Calendar URL:", error);
    return "#";
  }
}

/**
 * Helper to parse appointment date and time into a Date object
 */
export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const date = new Date(dateStr);
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3];

      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
        if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
      }
      
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    return date;
  } catch (error) {
    console.error("Error parsing appointment date/time:", error);
    return null;
  }
}
