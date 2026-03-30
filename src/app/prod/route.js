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
        // Skip invalid bookings
        if (!booking.date || !booking.start || !booking.end) {
          continue;
        }

        const date = new Date(booking.date);
        const startHour = parseInt(booking.start);
        const endHour = parseInt(booking.end);
        
        // Skip if date is invalid or hours are invalid
        if (isNaN(date.getTime()) || isNaN(startHour) || isNaN(endHour) || startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
          console.log("Skipping booking with invalid date/time:", booking);
          continue;
        }

        // Skip if end time is before start time
        if (endHour <= startHour) {
          console.log("Skipping booking with invalid duration:", booking);
          continue;
        }

        // Create proper timezone-aware dates for Europe/Amsterdam
        const timeZone = 'Europe/Amsterdam';
        const startDateTime = new Date(date.getTime() + startHour * 3600000);
        const endDateTime = new Date(date.getTime() + endHour * 3600000);
        
        const getOffsetHours = (d) => {
          const iso = d.toLocaleString('en-CA', { timeZone, hour12: false }).replace(', ', 'T');
          const lie = new Date(iso + 'Z');
          return -(lie - d) / 3600000;
        };
        
        const startOffset = getOffsetHours(startDateTime);
        const endOffset = getOffsetHours(endDateTime);
        const offsetStr = (n) => `${n >= 0 ? '+' : ''}${String(n).padStart(2, '0')}:00`;
        
        const startTimeString = `${startDateTime.getFullYear()}-${String(startDateTime.getMonth() + 1).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}T${String(startDateTime.getHours()).padStart(2, '0')}:00:00${offsetStr(startOffset)}`;
        const endTimeString = `${endDateTime.getFullYear()}-${String(endDateTime.getMonth() + 1).padStart(2, '0')}-${String(endDateTime.getDate()).padStart(2, '0')}T${String(endDateTime.getHours()).padStart(2, '0')}:00:00${offsetStr(endOffset)}`;
        
        // Parse as timezone-aware dates
        const parsedStartDateTime = new Date(startTimeString);
        const parsedEndDateTime = new Date(endTimeString);

        // Skip if date parsing failed
        if (isNaN(parsedStartDateTime.getTime()) || isNaN(parsedEndDateTime.getTime())) {
          console.log("Skipping booking with failed date parsing:", booking);
          continue;
        }

        events.push({
          start: [
            parsedStartDateTime.getUTCFullYear(),
            parsedStartDateTime.getUTCMonth() + 1,
            parsedStartDateTime.getUTCDate(),
            parsedStartDateTime.getUTCHours(),
            parsedStartDateTime.getUTCMinutes(),
          ],
          duration: { 
            hours: endHour - startHour, 
            minutes: 0 
          },
          title: `Booking for ${booking.user} (${booking.npeople})`,
          description: booking.description || "No description",
          uid: `${booking.id}@app.makerspacedelft.nl`,
          location: "Makerspace Delft",
          categories: ["Bookings"],
          startInputType: "utc",
          startOutputType: "utc",
        });
      }
    } else {
      console.log("No bookings found, creating empty calendar");
    }

    //console.log("Events to create:", JSON.stringify(events, null, 2));
    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS creation error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
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
