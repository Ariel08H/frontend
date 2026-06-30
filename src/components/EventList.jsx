import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import EventPreview from './EventPreview';
import { apiRequest } from '../services/api';
import { useOutletContext } from 'react-router-dom';

const EventList = ({ showMyEvents = false, showFavoritesOnly = false }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { favorites } = useOutletContext();

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

        if (showFavoritesOnly) {
          filteredEvents = filteredEvents.filter((event) =>
            favorites.includes(String(event.id))
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
  }, [showMyEvents, showFavoritesOnly, favorites, isLoaded, isSignedIn, user]);

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
    if (showFavoritesOnly) {
      return <p>You have no favorite events yet.</p>;
    }

    return (
      <p>
        {showMyEvents
          ? 'You have not created any events yet.'
          : 'No events found.'}
      </p>
    );
  }

  return (
    <section className="list">
      {events.map((event) => {
        const isFavorite = favorites.includes(String(event.id));

        return (
          <EventPreview
            key={event.id}
            event={event}
            isFavorite={isFavorite}
          />
        );
      })}
    </section>
  );
};

export default EventList;