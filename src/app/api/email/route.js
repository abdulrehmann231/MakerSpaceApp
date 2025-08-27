import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter for Nodemailer
const createTransporter = () => {
  // For Gmail (you can change this to other providers)
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // Your Gmail app password
    },
    secure: true
  });
};



// Email templates
const getBookingConfirmationTemplate = (userEmail, bookingDetails) => {
  const { date, start, end, npeople } = bookingDetails;
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Athens'
  });

  return {
    subject: 'Booking Confirmation - Makerspace Delft',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Makerspace Delft</h1>
          <p style="color: white; margin: 10px 0 0 0;">Booking Confirmation</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">Booking Confirmed!</h2>
          <p>Dear User,</p>
          <p>Your booking has been successfully confirmed. Here are the details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Booking Details</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${start}:00 - ${end}:00</p>
            <p><strong>Number of People:</strong> ${npeople}</p>
            <p><strong>Location:</strong> Makerspace Delft</p>
          </div>
          
          <p>Please arrive 10 minutes before your scheduled time. If you need to cancel or modify your booking, please contact us as soon as possible.</p>
          
          <p>Thank you for choosing Makerspace Delft!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              The Makerspace Delft Team<br>
              <a href="mailto:contact@makerspacedelft.nl" style="color: #667eea;">contact@makerspacedelft.nl</a>
            </p>
          </div>
        </div>
      </div>
    `
  };
};

const getWelcomeTemplate = ( firstName, baseUrl) => {
  return {
    subject: 'Welcome to Makerspace Delft!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Makerspace Delft</h1>
          <p style="color: white; margin: 10px 0 0 0;">Welcome to Our Community!</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${firstName}!</h2>
          <p>Thank you for joining Makerspace Delft! We're excited to have you as part of our community.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">What's Next?</h3>
            <ul style="color: #333;">
              <li>Explore our available equipment and facilities</li>
              <li>Book your first session</li>
              <li>Join our community events</li>
              <li>Connect with other makers</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, don't hesitate to reach out to us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/bookings" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Book Your First Session
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              The Makerspace Delft Team<br>
              <a href="mailto:contact@makerspacedelft.nl" style="color: #667eea;">contact@makerspacedelft.nl</a>
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, userEmail, bookingDetails, firstName } = body;

    // Validate required fields
    if (!type || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Get base URL from request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const transporter = createTransporter();

    await new Promise((resolve, reject) => {
      // verify connection configuration
      transporter.verify(function (error, success) {
          if (error) {
              console.log(error);
              reject(error);
          } else {
              console.log("Server is ready to take our messages");
              resolve(success);
          }
      });
  });

    let emailContent;

    // Generate email content based on type
    switch (type) {
      case 'booking-confirmation':
        if (!bookingDetails) {
          return NextResponse.json(
            { success: false, error: 'Booking details required' },
            { status: 400 }
          );
        }
        emailContent = getBookingConfirmationTemplate(userEmail, bookingDetails);
        break;

      case 'welcome':
        if (!firstName) {
          return NextResponse.json(
            { success: false, error: 'First name required' },
            { status: 400 }
          );
        }
        emailContent = getWelcomeTemplate( firstName, baseUrl);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Send email
    const mailOptions = {
      from: `"Makerspace Delft" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    await new Promise((resolve, reject) => {
      // send mail
      transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
              console.error(err);
              reject(err);
          } else {
              console.log(info);
              resolve(info);
          }
      });
  });

    console.log(`Email sent successfully to ${userEmail} (${type})`);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

