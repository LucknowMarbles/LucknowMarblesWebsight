import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import axios from 'axios';

const GoogleCalendarCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No authorization code found');
        }

        // Exchange the code for tokens
        await axios.post('http://localhost:5001/api/calendar/auth-callback', { code });
        
        message.success('Successfully connected to Google Calendar');
        navigate('/admin/calendar'); // Redirect back to calendar page
      } catch (error) {
        console.error('Error handling callback:', error);
        message.error('Failed to connect Google Calendar');
        navigate('/admin/calendar');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spin size="large" />
      <p className="mt-4">Connecting to Google Calendar...</p>
    </div>
  );
};

export default GoogleCalendarCallback; 