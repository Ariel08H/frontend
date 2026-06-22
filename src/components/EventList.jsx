import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import EventPreview from './EventPreview';
import { apiRequest } from '../services/api';

const EventList = ({ showMyEvents = false }) => {
  const { user, isLoaded, isSignedIn } = useUser();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);

      const data = await apiRequest('/api/events');

      let filteredEvents = data || [];

      if (showMyEvents) {
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        filteredEvents = filteredEvents.filter(
          (event) => event.user_email === userEmail
        );
      }

      setEvents(filteredEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return;

  if (showMyEvents && !isSignedIn) {
    setEvents([]);
    setLoading(false);
    return;
  }

  fetchEvents();
}, [showMyEvents, isLoaded, isSignedIn, user]);

  if (loading || !isLoaded) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (showMyEvents && !isSignedIn) {
    return <p>You need to be logged in to see your events.</p>;
  }

  if (events.length === 0) {
    return <p>{showMyEvents ? 'You have not created any events yet.' : 'No events found.'}</p>;
  }

  return (
    <section className="list">
      {events.map((event) => (
        <EventPreview key={event.id} event={event} />
      ))}
    </section>
  );
};

export default EventList;