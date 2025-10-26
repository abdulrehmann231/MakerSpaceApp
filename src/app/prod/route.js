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

    if (bookings && bookings.length > 0) {
      for (const booking of bookings) {
        const date = new Date(booking.date); // already local (string like "2025-10-26")
        const startHour = parseInt(booking.start);
        const endHour = parseInt(booking.end);

        events.push({
          start: [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            startHour,
            0,
          ],
          end: [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            endHour,
            0,
          ],
          title: `Booking for ${booking.user} (${booking.npeople})`,
          description: booking.description || "No description",
          uid: `${booking.id}@app.makerspacedelft.nl`,
          location: "Makerspace Delft",
          categories: ["Bookings"],
          startInputType: "local",
          startOutputType: "local",
          tzid: "Europe/Amsterdam", // 🕓 Correct timezone for all bookings
        });
      }
    } else {
      console.log("No bookings found, creating empty calendar");
    }

    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS creation error:", error);
      return new NextResponse("Failed to generate calendar", { status: 500 });
    }

    console.log("Calendar generated successfully");

    return new NextResponse(value, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=makerspace.ics",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Calendar generation error:", err);
    return NextResponse.json({ code: "ERROR", msg: err.message }, { status: 500 });
  }
}
