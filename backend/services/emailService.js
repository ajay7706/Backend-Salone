const sgMail = require('@sendgrid/mail');
const fs = require('fs');

// Initialize SendGrid API key from environment variable.
// The key should be stored securely in the hosting environment (e.g. Render secrets).
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.warn('⚠️ SENDGRID_API_KEY is not set. Email delivery will fail.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Send an email using SendGrid
 * @param {{
 *   to: string | string[];
 *   from?: string; // defaults to process.env.EMAIL_FROM or EMAIL_USER
 *   subject: string;
 *   html: string;
 *   attachments?: Array<{path: string; filename?: string}>;
 * }} options
 * @returns {Promise<boolean>} resolves true on success, rejects on error
 */
async function sendEmail(options) {
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key is not configured');
  }

  const fromAddress =
    options.from ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    'noreply@luxesalon.com';

  const msg = {
    to: options.to,
    from: fromAddress,
    subject: options.subject,
    html: options.html,
  };

  // handle attachments if provided
  if (options.attachments && options.attachments.length) {
    msg.attachments = [];
    for (const att of options.attachments) {
      try {
        const data = fs.readFileSync(att.path);
        msg.attachments.push({
          content: data.toString('base64'),
          filename: att.filename || att.path.split('/').pop(),
          type: 'application/octet-stream',
          disposition: 'attachment',
        });
      } catch (err) {
        // file read error; fail the send
        throw new Error(`Failed to read attachment ${att.path}: ${err.message}`);
      }
    }
  }

  try {
    const result = await sgMail.send(msg);
    // SendGrid returns an array of response objects
    console.log('✓ Email sent via SendGrid', {
      to: options.to,
      subject: options.subject,
      status: result[0] && result[0].statusCode,
    });
    return true;
  } catch (error) {
    console.error('✗ SendGrid send failure:',
      error.response ? error.response.body : error.message);
    throw error;
  }
}

module.exports = {
  sendEmail,
};
