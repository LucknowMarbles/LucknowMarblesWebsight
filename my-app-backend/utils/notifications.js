const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Gmail API setup
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

// Configure Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Function to send email using Gmail API
const sendEmail = async (to, subject, body) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'info@lucknowmarbles.com',
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'Lucknow Marbles <info@lucknowmarbles.com>',
      to: to,
      subject: subject,
      text: body,
    };

    const result = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Function to send SMS (unchanged)
const sendSMS = async (to, body) => {
  try {
    console.log(`Attempting to send SMS to ${to}`);
    const message = await twilioClient.messages.create({
      body: body,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to: to
    });
    console.log(`Message sent with SID: ${message.sid}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendSMS,
};