import { NextResponse } from "next/server";
import { createEvents } from "ics";
import { getAllBookings } from "../../lib/backend/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action !== "calendar") {
      return NextResponse.json({ code: "METHOD_NOT_ALLOWED" }, { status: 405 });
    }

    const { Items: bookings } = await getAllBookings("bookings");

    const events = [];
    for (const booking of bookings) {
      const date = new Date(Date.parse(booking.date));
      const rawStartHour = parseInt(booking.start, 10);
      const durationHours = parseInt(booking.end, 10) - parseInt(booking.start, 10);

      let adjustedDate = new Date(date);
      let adjustedHour = rawStartHour;

      if (rawStartHour < 0) {
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        adjustedHour = 24 + rawStartHour;
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
    return NextResponse.json({ code: "ERROR", msg: err.message }, { status: 500 });
  }
}


