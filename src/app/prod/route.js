import { NextResponse } from "next/server";
import { createEvents } from "ics";
import { getAllBookings } from "../../lib/backend/db";

function getTimeZoneOffset(date, timeZone) {

  // Abuse the Intl API to get a local ISO 8601 string for a given time zone.
  let iso = date.toLocaleString('en-CA', { timeZone, hour12: false }).replace(', ', 'T');
  
  // Include the milliseconds from the original timestamp
  iso += '.' + date.getMilliseconds().toString().padStart(3, '0');
  
  // Lie to the Date object constructor that it's a UTC time.
  const lie = new Date(iso + 'Z');

  // Return the difference in timestamps, as minutes
  // Positive values are West of GMT, opposite of ISO 8601
  // this matches the output of `Date.getTimeZoneOffset`
  return -(lie - date) / 60 / 1000;
}

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
        const date = new Date(Date.parse(booking.date));
        
        // Calculate timezone offset for CET/CEST (Europe/Amsterdam)
        const offset = getTimeZoneOffset(date, 'Europe/Amsterdam') / 60;

        let adjustedDate = new Date(date);
        let adjustedHour = parseInt(booking.start) + offset;
        
        // Handle negative hours by adjusting the date
        if (adjustedHour < 0) {
          adjustedDate.setDate(adjustedDate.getDate() - 1);
          adjustedHour = 24 + adjustedHour;
        }
        
        // Handle hours >= 24 by adjusting the date
        if (adjustedHour >= 24) {
          adjustedDate.setDate(adjustedDate.getDate() + 1);
          adjustedHour = adjustedHour - 24;
        }

        events.push({
          start: [adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedHour, 0],
          duration: { hours: parseInt(booking.end) - parseInt(booking.start), minutes: 0 },
          title: 'Booking for ' + booking.user + ' (' + booking.npeople + ')',
          description: 'No description',
          uid: booking.id + "@app.makerspacedelft.nl",
          location: 'Makerspace Delft',
          categories: ['Bookings'],
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


