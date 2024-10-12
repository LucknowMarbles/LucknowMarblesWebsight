import React, { useEffect } from 'react';
import '../GoogleCalendarPage.css';

const GoogleCalendarPage = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', initClient);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initClient = () => {
    window.gapi.client.init({
      apiKey: 'YOUR_API_KEY',
      clientId: 'YOUR_CLIENT_ID',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: 'https://www.googleapis.com/auth/calendar.readonly'
    }).then(() => {
      loadCalendar();
    });
  };

  const loadCalendar = () => {
    const calendarId = 'YOUR_CALENDAR_ID'; // Use 'primary' for the user's primary calendar
    const apiKey = 'YOUR_API_KEY';

    window.gapi.client.calendar.events.list({
      'calendarId': calendarId,
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then(response => {
      const events = response.result.items;
      // You can process and display the events here if needed
    });

    // Embed the calendar
    const iframe = document.createElement('iframe');
    iframe.src = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&key=${apiKey}`;
    iframe.style.border = '0';
    iframe.width = '800';
    iframe.height = '600';
    document.getElementById('calendar-container').appendChild(iframe);
  };

  return (
    <div className="google-calendar-page">
      <h1>Google Calendar</h1>
      <div id="calendar-container"></div>
    </div>
  );
};

export default GoogleCalendarPage;