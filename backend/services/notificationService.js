const nodemailer = require("nodemailer");
const twilio = require("twilio");
const fs = require("fs");

// Email configuration
// nodemailer will connect to Gmail's SMTP servers. In some hosting
// environments (Render, Heroku, etc.) outgoing connections on the
// default SMTPS ports can be blocked, which results in ETIMEDOUT.  If
// you keep having timeouts you should switch to a third‑party API
// provider (SendGrid, Mailgun, etc.) or open a support ticket with your
// host.  Be sure that the credentials are correct and that the app
// password has no stray spaces (Gmail app passwords are 16 characters
// with no spaces).

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// verify connection configuration when the module is loaded so that
// any misconfiguration surfaces immediately instead of during sendMail
transporter.verify((err, success) => {
  if (err) {
    console.error("✗ SMTP configuration error:", err.message);
  } else {
    console.log("✓ SMTP server is ready to take messages");
  }
});

// Twilio client is lazily initialized below to avoid module-load errors when
// TWILIO credentials are not provided during local import/time.
let _twilioClient = null;
function getTwilioClient() {
  if (_twilioClient) return _twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  _twilioClient = twilio(sid, token);
  return _twilioClient;
}

const http = require('http');
const https = require('https');

/**
 * Send booking confirmation email with PDF attachment
 */
exports.sendBookingConfirmationEmail = async (
  userEmail,
  userName,
  bookingDetails,
  pdfPath
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@luxesalon.com",
      to: userEmail,
      subject: "Booking Confirmation - Your Appointment is Approved ✓",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Luxe Salon</h1>
            <p style="color: #e0e7ff; text-align: center; margin: 0;">Your appointment has been confirmed!</p>
          </div>
          
          <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e40af; margin-top: 0;">Hello ${userName}! 👋</h2>
            <p>Great news! Your appointment has been <strong>approved and confirmed</strong>.</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Appointment Details:</h3>
              <p><strong>📅 Date:</strong> ${bookingDetails.date}</p>
              <p><strong>⏰ Time:</strong> ${bookingDetails.time}</p>
              <p><strong>✄️ Service:</strong> ${bookingDetails.serviceName}</p>
              <p><strong>💰 Amount:</strong> Rs. ${bookingDetails.servicePrice}</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              ✓ Please arrive 5 minutes early<br>
              ✓ Your receipt is attached below<br>
              ✓ For any changes, contact us at least 24 hours before
            </p>
            
            <a href="mailto:support@luxesalon.com" style="display: inline-block; background: #1e40af; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 20px 0;">Contact Support</a>
            
            <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              Thank you for choosing Luxe Salon. We're excited to see you!<br>
              <strong>Luxe Salon</strong> | 📍 123 Main Street, City | 📞 +1234567890
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `receipt-${bookingDetails._id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Confirmation email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending email:", error.message);
    throw error;
  }
};

/**
 * Send rejection email
 */
exports.sendRejectionEmail = async (
  userEmail,
  userName,
  bookingDetails,
  reason
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@luxesalon.com",
      to: userEmail,
      subject: "Booking Status Update - Appointment Could Not Be Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Luxe Salon</h1>
            <p style="color: #fee2e2; text-align: center; margin: 0;">Booking Update</p>
          </div>
          
          <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e40af; margin-top: 0;">Hello ${userName},</h2>
            <p>Unfortunately, we couldn't confirm your appointment for the requested time.</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Booking Details:</h3>
              <p><strong>📅 Date:</strong> ${bookingDetails.date}</p>
              <p><strong>⏰ Time:</strong> ${bookingDetails.time}</p>
              <p><strong>✄️ Service:</strong> ${bookingDetails.serviceName}</p>
              <p><strong>❌ Reason:</strong> ${reason}</p>
            </div>
            
            <p>Please try booking for a different date and time. Our team is ready to help!</p>
            
            <a href="mailto:support@luxesalon.com" style="display: inline-block; background: #1e40af; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 20px 0;">Reschedule Appointment</a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Rejection email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending rejection email:", error.message);
    throw error;
  }
};

/**
 * Send WhatsApp notification
 */
exports.sendWhatsAppNotification = async (
  phoneNumber,
  userName,
  bookingDetails,
  isApproved = true,
  mediaUrl = null
) => {
  try {
    const message = isApproved
      ? `Hi ${userName}! 🎉\n\nYour appointment at Luxe Salon is confirmed!\n\n📅 Date: ${bookingDetails.date}\n⏰ Time: ${bookingDetails.time}\n✄️ Service: ${bookingDetails.serviceName}\n💰 Cost: Rs. ${bookingDetails.servicePrice}\n\nPlease arrive 5 minutes early. See you soon! ✨`
      : `Hi ${userName}!\n\nWe regret to inform you that your requested appointment time is not available.\n\nPlease visit our website to reschedule: https://yourdomain.com\n\nThank you!`;

    // Helper to normalize numbers and accept values with or without 'whatsapp:' prefix
    const normalizeNumber = (raw) => {
      if (!raw) return null;
      let s = String(raw).trim();
      // strip whatsapp: prefix if present
      if (s.toLowerCase().startsWith("whatsapp:")) s = s.replace(/^whatsapp:/i, "");
      // remove spaces
      s = s.replace(/\s+/g, "");
      // ensure it starts with +; if not, prefix + (assumes user provided full national number)
      if (!s.startsWith("+")) {
        s = `+${s}`;
      }
      return s;
    };

    const senderRaw = process.env.TWILIO_WHATSAPP_NUMBER || "";
    const sender = normalizeNumber(senderRaw);
    const recipient = normalizeNumber(phoneNumber);

    if (!sender) {
      console.warn("TWILIO_WHATSAPP_NUMBER is not configured");
      return false;
    }
    if (!recipient) {
      console.warn("Recipient phone number is invalid or empty");
      return false;
    }

    const payload = {
      from: `whatsapp:${sender}`,
      to: `whatsapp:${recipient}`,
      body: message,
    };

    // Attach mediaUrl directly if provided (Twilio will fetch it).
    // Validation is skipped to avoid blocking local URLs during development.
    if (mediaUrl) {
      payload.mediaUrl = Array.isArray(mediaUrl) ? mediaUrl : [mediaUrl];
    }

    const client = getTwilioClient();
    if (!client) {
      console.warn('Twilio credentials are not configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN). WhatsApp will not be sent.');
      return false;
    }

    const result = await client.messages.create(payload);

    console.log("✓ WhatsApp sent:", result.sid);
    return true;
  } catch (error) {
    console.error("✗ Error sending WhatsApp:", error.message);
    // Don't throw - WhatsApp is optional
    return false;
  }
};

/**
 * Send completion notification
 */
exports.sendCompletionNotification = async (userEmail, userName, booking, receiptUrl = null) => {
  try {
    let receiptSection = "";
    if (receiptUrl) {
      receiptSection = `
        <div style="background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Your Receipt</h3>
          <p>You can download your receipt <a href="${receiptUrl}">here</a>.</p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@luxesalon.com",
      to: userEmail,
      subject: "Appointment Completed - Please Rate Your Experience",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Luxe Salon</h1>
            <p style="color: #e0e7ff; text-align: center; margin: 0;">Thank you for visiting us!</p>
          </div>
          
          <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e40af; margin-top: 0;">Hello ${userName}! 😊</h2>
            <p>Thank you for choosing Luxe Salon for your appointment!</p>
            
            ${receiptSection}

            <div style="background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">How was your experience?</h3>
              <p>We'd love to hear from you! Please rate your appointment and share your feedback.</p>
              <a href="https://yourdomain.com/my-bookings" style="display: inline-block; background: #1e40af; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Rate Your Experience</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">Your feedback helps us serve you better!</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Completion email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("✗ Error sending completion email:", error.message);
    throw error;
  }
};
