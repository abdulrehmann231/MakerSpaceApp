import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmationEmail(userEmail, bookingDetails) {
  try {
    const { date, start, end, npeople = 1 } = bookingDetails
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - Makerspace Delft</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #007bff; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your Makerspace Delft booking has been successfully created</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            <p>Thank you for booking with Makerspace Delft. Your reservation has been confirmed.</p>
            
            <div class="booking-details">
              <h3>📅 Booking Details</h3>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${start}:00 - ${end}:00</p>
              <p><strong>Number of People:</strong> ${npeople}</p>
            </div>
            
            <p>You can manage your bookings, make changes, or cancel at any time through our platform.</p>
            
            <a href="https://app.makerspacedelft.nl/" class="button">Manage My Bookings</a>
            
            <p><strong>Need to make changes?</strong></p>
            <ul>
              <li>Log in to your account</li>
              <li>Go to the Bookings section</li>
              <li>Modify or cancel your booking as needed</li>
            </ul>
            
            <div class="footer">
              <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
              <p><strong>Best regards,</strong><br>The Makerspace Delft Team</p>
              <p>📧 contact@makerspacedelft.nl</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Makerspace Delft <onboarding@resend.dev>',
      to: [userEmail],
      subject: `Booking Confirmation: ${date} (${start}:00-${end}:00)`,
      html: emailContent,
      // Add headers to improve deliverability
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@makerspacedelft.nl>',
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      }
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }

    console.log('Booking confirmation email sent successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(userEmail, firstName) {
  try {
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Makerspace Delft</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Makerspace Delft!</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Welcome to Makerspace Delft! Your account has been successfully created.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Book workspace time slots</li>
              <li>Manage your bookings</li>
              <li>Update your profile</li>
              <li>Contact our team for support</li>
            </ul>
            
            <a href="https://app.makerspacedelft.nl/" class="button">Start Booking</a>
            
            <div class="footer">
              <p>If you have any questions, feel free to reach out to us.</p>
              <p><strong>Best regards,</strong><br>The Makerspace Delft Team</p>
              <p>📧 contact@makerspacedelft.nl</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Makerspace Delft <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Welcome to Makerspace Delft!',
      html: emailContent,
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@makerspacedelft.nl>',
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      }
    })

    if (error) {
      console.error('Welcome email sending failed:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}
