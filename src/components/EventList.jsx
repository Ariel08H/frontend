import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import EventPreview from './EventPreview';
import { apiRequest } from '../services/api';
import { useOutletContext } from 'react-router-dom';

const EventList = ({
  showMyEvents = false,
  showFavoritesOnly = false,
  showPastEvents = false,
}) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { favorites = [] } = useOutletContext() || {};

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('soonest');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiRequest('/api/events');

        setEvents(data || []);
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
  }, [showMyEvents, isLoaded, isSignedIn]);

  let displayedEvents = events;

  const now = new Date();

  if (showPastEvents) {
    displayedEvents = displayedEvents.filter((event) => {
      const eventDate = event.date || event.last_date;

      if (!eventDate) return false;

      const parsedDate = new Date(eventDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return false;
      }

      return parsedDate < now;
    });
  } else {
    displayedEvents = displayedEvents.filter((event) => {
      const eventDate = event.date || event.last_date;

      if (!eventDate) return false;

      const parsedDate = new Date(eventDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return false;
      }

      return parsedDate >= now;
    });
  }

  if (showMyEvents) {
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    displayedEvents = displayedEvents.filter(
      (event) => event.user_email === userEmail
    );
  }

  if (showFavoritesOnly) {
    displayedEvents = displayedEvents.filter((event) =>
      favorites.includes(String(event.id))
    );
  }

  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    displayedEvents = displayedEvents.filter((event) => {
      return (
        event.title?.toLowerCase().includes(lowerSearchTerm) ||
        event.description?.toLowerCase().includes(lowerSearchTerm) ||
        event.location?.toLowerCase().includes(lowerSearchTerm) ||
        event.author?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }

  if (sortBy === 'important') {
    displayedEvents = displayedEvents.filter(
      (event) => event.isImportant
    );
  }

  displayedEvents = [...displayedEvents].sort((a, b) => {
    if (sortBy === 'soonest') {
      const dateA = new Date(a.date || a.last_date);
      const dateB = new Date(b.date || b.last_date);

      return dateA - dateB;
    }

    if (sortBy === 'a-z') {
      return (a.title || '').localeCompare(b.title || '');
    }

    if (sortBy === 'z-a') {
      return (b.title || '').localeCompare(a.title || '');
    }

    return 0;
  });

  if (loading || !isLoaded) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (showMyEvents && !isSignedIn) {
    return <p>You need to be logged in to see your events.</p>;
  }

  return (
    <section className="list-container">
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="soonest">Soonest Event</option>
          <option value="a-z">Name A-Z</option>
          <option value="z-a">Name Z-A</option>
          <option value="important">Important Only</option>
        </select>
      </div>

      {displayedEvents.length === 0 ? (
        <>
          {searchTerm ? (
            <p>No events match your search or filter.</p>
          ) : sortBy === 'important' ? (
            <p>No important events found.</p>
          ) : showPastEvents ? (
            <p>No past events found.</p>
          ) : showFavoritesOnly ? (
            <p>You have no favorite events yet.</p>
          ) : showMyEvents ? (
            <p>You have not created any upcoming events yet.</p>
          ) : (
            <p>No upcoming events found.</p>
          )}
        </>
      ) : (
        <div className="list">
          {displayedEvents.map((event) => {
            const isFavorite = favorites.includes(String(event.id));

            return (
              <EventPreview
                key={event.id}
                event={event}
                isFavorite={isFavorite}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default EventList;