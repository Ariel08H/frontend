import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';

const Hero = () => {
  const [closestEvents, setClosestEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchClosestEvents = async () => {
      try {
        const data = await apiRequest('/api/events');

        const now = new Date();

        const upcomingEvents = data
          .filter((event) => {
            const eventDate = event.date || event.last_date;

            if (!eventDate) return false;

            const parsedDate = new Date(eventDate);

            if (Number.isNaN(parsedDate.getTime())) return false;

            return parsedDate >= now;
          })
          .sort((a, b) => {
            const dateA = new Date(a.date || a.last_date);
            const dateB = new Date(b.date || b.last_date);

            return dateA - dateB;
          })
          .slice(0, 3);

        setClosestEvents(upcomingEvents);
      } catch (error) {
        console.error('Error fetching closest events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchClosestEvents();
  }, []);

  const getCurrentDay = () => {
    return new Date().getDate();
  };

  const getCurrentMonthYear = () => {
    return new Date().toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatEventTime = (event) => {
    const eventDate = event.date || event.last_date;

    if (!eventDate) return 'No time';

    const parsedDate = new Date(eventDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Invalid time';
    }

    return parsedDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-small-title">Plan smarter. Remember everything.</p>

        <h1>
          Organize your events with <span>Evently</span>
        </h1>

        <p className="hero-description">
          Evently helps you create, manage, and keep track of your important
          events in one simple place. Add events, save details, attach images,
          and never lose track of what is coming next.
        </p>

        <div className="hero-buttons">
          <Link to="/create" className="hero-btn primary">
            Create Event
          </Link>

          <Link to="/about" className="hero-btn secondary">
            Learn More
          </Link>
        </div>
      </div>

      <div className="hero-card">
        <div className="calendar-card">
          <div className="calendar-top">
            <span></span>
            <span></span>
          </div>

          <div className="calendar-date">
            <p>Today</p>
            <h2>{getCurrentDay()}</h2>
            <span>{getCurrentMonthYear()}</span>
          </div>

          {loadingEvents ? (
            <div className="event-preview">
              <div className="event-dot"></div>
              <div>
                <h3>Loading events...</h3>
                <p>Please wait</p>
              </div>
            </div>
          ) : closestEvents.length > 0 ? (
            closestEvents.map((event, index) => (
              <Link
                to={`/event/${event.id}`}
                className="event-preview"
                key={event.id}
              >
                <div
                  className={`event-dot ${
                    index === 1 ? 'pink' : index === 2 ? 'purple' : ''
                  }`}
                ></div>

                <div>
                  <h3>{event.title || 'Untitled Event'}</h3>
                  <p>
                    {formatEventTime(event)}
                    {' • '}
                    {event.location || 'No location'}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="event-preview">
              <div className="event-dot"></div>
              <div>
                <h3>No upcoming events</h3>
                <p>Create your first event</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;