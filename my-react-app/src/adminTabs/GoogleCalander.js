import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';

// Load credentials from file
const credentials = JSON.parse(fs.readFileSync('./google-credentials.json'));

const GOOGLE_CALENDAR_CREDENTIALS = {
  client_id: credentials.web.client_id,
  client_secret: credentials.web.client_secret,
  redirect_uris: credentials.web.redirect_uris
};

const oauth2Client = new OAuth2Client(
  GOOGLE_CALENDAR_CREDENTIALS.client_id,
  GOOGLE_CALENDAR_CREDENTIALS.client_secret,
  GOOGLE_CALENDAR_CREDENTIALS.redirect_uris[0]
);

// Set up Google Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// ... rest of your code