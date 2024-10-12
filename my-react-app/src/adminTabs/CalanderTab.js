import React from 'react';
import { Link } from 'react-router-dom';

function CalendarTab() {
  return (
    <div className="calendar-section">
      <h2>Google Calendar</h2>
      <Link to="/pages/calendar" className="calendar-link">View Full Calendar</Link>
    </div>
  );
}

export default CalendarTab;