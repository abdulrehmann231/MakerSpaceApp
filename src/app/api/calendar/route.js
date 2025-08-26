import { NextResponse } from 'next/server';
import { createEvents } from 'ics';
import { getAllBookings } from '../../../lib/backend/db';

export async function GET() {
	try {
		
		const { Items: bookings } = await getAllBookings('bookings');
        console.log(bookings);

		// Build ICS events exactly like the original Lambda implementation
		const events = [];
		for (const booking of bookings) {
			const date = new Date(Date.parse(booking.date));
			const startHour = parseInt(booking.start, 10) - 2; // keep original offset behavior
			const durationHours = parseInt(booking.end, 10) - parseInt(booking.start, 10);

			events.push({
				start: [
					date.getFullYear(),
					date.getMonth() + 1,
					date.getDate(),
					startHour,
					0
				],
				duration: { hours: durationHours, minutes: 0 },
				title: `Booking for ${booking.user} (${booking.npeople || 1})`,
				description: 'No description',
				uid: `${booking.id}@app.makerspacedelft.nl`,
				location: 'Makerspace Delft',
				categories: ['Bookings']
			});
		}

        console.log(events, 'events');


		const { error, value } = createEvents(events);
		if (error) {
            console.log(error);
			return new NextResponse('Failed to generate calendar', { status: 500 });
		}

		return new NextResponse(value, {
			status: 200,
			headers: {
				'Content-Type': 'text/calendar'
			}
		});
	} catch (err) {
		console.error('Calendar generation error:', err);
		return NextResponse.json({ code: 'ERROR', msg: err.message }, { status: 500 });
	}
}


