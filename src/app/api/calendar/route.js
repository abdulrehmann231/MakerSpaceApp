import { NextResponse } from "next/server";
import { createEvents } from "ics";
import { getAllBookings } from "../../../lib/backend/db";

export async function GET() {
  try {
    const { Items: bookings } = await getAllBookings("bookings");
    

    // Build ICS events exactly like the original Lambda implementation
    const events = [];
    for (const booking of bookings) {
      // Correct approach: Handle date rollover
      const date = new Date(Date.parse(booking.date));
      const rawStartHour = parseInt(booking.start, 10) ;
      const durationHours = parseInt(booking.end, 10) - parseInt(booking.start, 10);

      let adjustedDate = new Date(date);
      let adjustedHour = rawStartHour;

      // Handle negative hours by rolling back the date
      if (rawStartHour < 0) {
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        adjustedHour = 24 + rawStartHour; // Convert -1 to 23, -2 to 22, etc.
      }

      events.push({
        start: [
          adjustedDate.getFullYear(),
          adjustedDate.getMonth() + 1,
          adjustedDate.getDate(),
          adjustedHour,
          0,
        ],
        duration: { hours: durationHours, minutes: 0 },
        title: `Booking for ${booking.user} (${booking.npeople || 1})`,
        description: "No description",
        uid: `${booking.id}@app.makerspacedelft.nl`,
        location: "Makerspace Delft",
        categories: ["Bookings"],
      });
    }

    

    const { error, value } = createEvents(events);
    if (error) {
    
      return new NextResponse("Failed to generate calendar", { status: 500 });
    }

    return new NextResponse(value, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar",
      },
    });
  } catch (err) {
    console.error("Calendar generation error:", err);
    return NextResponse.json(
      { code: "ERROR", msg: err.message },
      { status: 500 }
    );
  }
}
