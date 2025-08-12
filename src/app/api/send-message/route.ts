import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactFormData = await req.json();
    const { firstName, lastName, email, phone, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content for hotel
    const hotelEmailContent = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission - Hotel Anytime`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ea580c, #dc2626); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Hotel Anytime Website</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-left: 4px solid #ea580c;">
            <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${phone || 'Not provided'}</td>
              </tr>
            </table>
            
            <h3 style="color: #1f2937; margin: 25px 0 15px 0;">Message:</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 3px solid #ea580c;">
              <p style="margin: 0; color: #374151; line-height: 1.6;">${message}</p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af;">
            <p style="margin: 0; font-size: 14px;">This message was sent from the Hotel Anytime contact form</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Received on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    // Confirmation email for customer
    const customerEmailContent = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Thank you for contacting Hotel Anytime',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ea580c, #dc2626); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Hotel Anytime</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Dear ${firstName} ${lastName},</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for reaching out to Hotel Anytime. We have received your message and our team will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 3px solid #ea580c; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Your Message:</h3>
              <p style="color: #6b7280; margin: 0; font-style: italic;">"${message}"</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              In the meantime, feel free to explore our <strong>luxury accommodations</strong> and <strong>world-class amenities</strong>. 
              We look forward to hosting you at Hotel Anytime.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>📞 Need immediate assistance?</strong><br>
                Call us at: <a href="tel:+1555123456" style="color: #ea580c;">+1 (555) 123-4567</a>
              </p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af;">
            <p style="margin: 0; font-size: 14px;">Best regards,<br>Hotel Anytime Team</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">Experience luxury and comfort in the heart of the city</p>
          </div>
        </div>
      `,
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(hotelEmailContent),
      transporter.sendMail(customerEmailContent)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
