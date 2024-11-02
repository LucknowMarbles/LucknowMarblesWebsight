const { google } = require('googleapis');
require('dotenv').config();

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5001/api/calendar/auth-callback'
);

// Export all controller methods
const calendarController = {
  getAuthUrl: (req, res) => {
    try {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events'
        ],
        prompt: 'consent'
      });
      res.json({ url: authUrl });
    } catch (error) {
      console.error('Auth URL generation error:', error);
      res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  },

  handleAuthCallback: async (req, res) => {
    try {
      const { code } = req.query;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      req.session.googleTokens = tokens;
      await new Promise((resolve) => req.session.save(resolve));

      res.redirect(`${process.env.FRONTEND_URL}/admin/calendar`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/admin/calendar?error=auth_failed`);
    }
  },

  getAuthStatus: async (req, res) => {
    try {
    console.log(req);
      const isAuthenticated = !!(req.session.googleTokens?.access_token);
      res.json({ isAuthenticated });
    } catch (error) {
      console.error('Auth status error:', error);
      res.status(500).json({ error: 'Failed to check auth status' });
    }
  },

  listCalendars: async (req, res) => {
    try {
      if (!req.session.googleTokens) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      oauth2Client.setCredentials(req.session.googleTokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.calendarList.list();
      res.json({ calendars: response.data.items });
    } catch (error) {
      console.error('Calendar list error:', error);
      res.status(500).json({ error: 'Failed to fetch calendars' });
    }
  },

  createEvent: async (req, res) => {
    try {
      if (!req.session.googleTokens) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { calendarId, event } = req.body;
      oauth2Client.setCredentials(req.session.googleTokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.insert({
        calendarId: calendarId || 'primary',
        resource: event,
      });

      res.json({ event: response.data });
    } catch (error) {
      console.error('Event creation error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
};

module.exports = calendarController;
  