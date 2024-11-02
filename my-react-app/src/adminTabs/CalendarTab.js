import React, { useState, useEffect } from 'react';
import { Button, Card, message, Spin } from 'antd';
import axios from 'axios';

axios.defaults.withCredentials = true; // Important!

function CalendarTab() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/calendar/auth-status', {
        withCredentials: true
      });
      console.log('Auth status response:', response.data);
      setIsAuthenticated(response.data.isAuthenticated);
    } catch (error) {
      console.error('Auth status check failed:', error);
      message.error('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/calendar/auth-url');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Auth URL fetch failed:', error);
      message.error('Failed to start authentication');
    }
  };

  const fetchCalendars = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/calendar/list');
      setCalendars(response.data.calendars);
    } catch (error) {
      console.error('Error fetching calendars:', error);
      message.error('Failed to fetch calendars');
    }
  };

  if (loading) {
    return <Spin size="large" className="flex justify-center items-center h-full" />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Google Calendar Integration</h2>
      
      {!isAuthenticated ? (
        <Card>
          <p className="mb-4">Connect your Google Calendar to manage events and schedules.</p>
          <Button type="primary" onClick={handleAuth}>
            Connect Google Calendar
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card title="Connected Calendars">
            <Button type="primary" onClick={fetchCalendars} className="mb-4">
              Refresh Calendars
            </Button>
            
            <div className="space-y-4">
              {calendars.map(calendar => (
                <Card key={calendar.id} size="small">
                  <h3 className="font-semibold">{calendar.summary}</h3>
                  <p className="text-gray-600">{calendar.description}</p>
                  <p className="text-sm text-gray-500">{calendar.id}</p>
                </Card>
              ))}
            </div>
          </Card>

          <iframe
            src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendars[0]?.id || '')}`}
            style={{ border: 0 }}
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="no"
          />
        </div>
      )}
    </div>
  );
}

export default CalendarTab; 