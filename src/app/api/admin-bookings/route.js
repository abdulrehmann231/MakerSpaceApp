import { NextResponse } from "next/server";
import { extractUser } from "../../../lib/backend/middleware";
import { getAllBookings } from "../../../lib/backend/db";

function isRecentOrFutureBooking(booking) {
  if (!booking || !booking.date) return false;
  const startHour = Number.parseInt(booking.start, 10);
  if (Number.isNaN(startHour)) return false;
  const bookingStart = new Date(`${booking.date}T${String(startHour).padStart(2, "0")}:00:00`);
  if (Number.isNaN(bookingStart.getTime())) return false;
  const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
  return bookingStart.getTime() >= last24Hours;
}

export async function GET(request) {
  try {
    const user = await extractUser(request.headers, "users");
    if (!user || user.user !== "admin") {
      return NextResponse.json({ code: "UNAUTHORIZED", msg: "Admin required" }, { status: 401 });
    }

    const { Items: allBookings } = await getAllBookings("bookings");
    const recentAndFutureBookings = (allBookings || [])
      .filter(isRecentOrFutureBooking)
      .sort((a, b) => {
        const aStart = new Date(`${a.date}T${String(a.start).padStart(2, "0")}:00:00`).getTime();
        const bStart = new Date(`${b.date}T${String(b.start).padStart(2, "0")}:00:00`).getTime();
        return aStart - bStart;
      });

    return NextResponse.json({ code: "FOUND", msg: recentAndFutureBookings }, { status: 200 });
  } catch (error) {
    console.error("GET admin bookings error:", error);
    return NextResponse.json({ code: "ERROR", msg: error.message }, { status: 500 });
  }
}

