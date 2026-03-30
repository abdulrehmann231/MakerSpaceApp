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
        
        // Parse date in local time context, then get DST-aware offset
        const localYear = date.getFullYear();
        const localMonth = date.getMonth() + 1;
        const localDay = date.getDate();
        
        // Create local datetime for start and end
        const startLocal = new Date(localYear, localMonth - 1, localDay, startHour, 0, 0, 0);
        const endLocal = new Date(localYear, localMonth - 1, localDay, endHour, 0, 0, 0);
        
        // Get DST-aware offset in hours
        const getOffsetHours = (d) => {
          const iso = d.toLocaleString('en-CA', { timeZone, hour12: false }).replace(', ', 'T');
          const lie = new Date(iso + 'Z');
          return -(lie - d) / 3600000;
        };
        
        const startOffset = getOffsetHours(startLocal);
        const endOffset = getOffsetHours(endLocal);
        const offsetStr = (n) => `${n >= 0 ? '+' : ''}${String(n).padStart(2, '0')}:00`;
        
        const startTimeString = `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}T${String(startHour).padStart(2, '0')}:00:00${offsetStr(startOffset)}`;
        const endTimeString = `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}T${String(endHour).padStart(2, '0')}:00:00${offsetStr(endOffset)}`;
        
        // Parse as timezone-aware dates
        const startDateTime = new Date(startTimeString);
        const endDateTime = new Date(endTimeString);

        // Skip if date parsing failed
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          console.log("Skipping booking with failed date parsing:", booking);
          continue;
        }

        events.push({
          start: [
            startDateTime.getUTCFullYear(),
            startDateTime.getUTCMonth() + 1,
            startDateTime.getUTCDate(),
            startDateTime.getUTCHours(),
            startDateTime.getUTCMinutes(),
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
