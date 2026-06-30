import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { apiRequest } from '../services/api';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, setFavorites } = useOutletContext();
  const { user, isSignedIn, isLoaded } = useUser();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);

        const data = await apiRequest(`/api/events/${id}`);

        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setErrorMsg(error.message || 'Server error while loading event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleFavorite = () => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(id)) {
        return prevFavorites.filter((favoriteId) => favoriteId !== id);
      }

      return [...prevFavorites, id];
    });
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this event? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      await apiRequest(`/api/events/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting event:', error);
      setErrorMsg(error.message || 'Server error while deleting event');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';

    const dateObj = new Date(dateValue);

    if (Number.isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateAndTime = (dateValue) => {
    if (!dateValue) return 'No date';

    const dateObj = new Date(dateValue);

    if (Number.isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return dateObj.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !isLoaded) {
    return (
      <div className="event-status-page">
        <div className="event-status-card">Loading event...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="event-status-page">
        <div className="event-status-card">{errorMsg}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-status-page">
        <div className="event-status-card">Event not found</div>
      </div>
    );
  }

  const eventDate = event.date || event.last_date;

  const loggedInUserEmail = user?.primaryEmailAddress?.emailAddress;
  const eventCreatorEmail = event.user_email;

  const isEventOwner =
    isSignedIn &&
    loggedInUserEmail &&
    eventCreatorEmail &&
    loggedInUserEmail === eventCreatorEmail;

  const isFavorite = favorites.includes(id);

  return (
    <main className="event-details-page">
      <section className="event-details-card">
        {event.img ? (
          <div className="event-image-wrapper">
            <img
              src={event.img}
              alt={event.title || 'Event image'}
              className="event-details-img"
            />

            {event.isImportant && (
              <span className="event-badge">Important</span>
            )}
          </div>
        ) : (
          <div className="event-image-placeholder">
            <span>No Image</span>

            {event.isImportant && (
              <span className="event-badge">Important</span>
            )}
          </div>
        )}

        <div className="event-content">
          <div className="event-header-row">
            <div>
              <p className="event-eyebrow">Event Details</p>
              <h1>{event.title || 'Untitled Event'}</h1>
            </div>

            <div className="event-actions-row">
              <button
                type="button"
                className="favorite-event-btn"
                onClick={handleFavorite}
              >
                {isFavorite ? '⭐ Favorited' : '☆ Favorite'}
              </button>

              {isEventOwner && (
                <>
                  <button
                    type="button"
                    className="edit-event-btn"
                    onClick={handleEdit}
                  >
                    Edit Event
                  </button>

                  <button
                    type="button"
                    className="delete-event-btn"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Event'}
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="event-description">
            {event.description || 'No description was added for this event.'}
          </p>

          <div className="event-info-grid">
            <div className="event-info-box">
              <span className="event-info-label">Author</span>
              <strong>{event.author || 'Anonymous'}</strong>
            </div>

            <div className="event-info-box">
              <span className="event-info-label">Created At</span>
              <strong>{formatDate(event.created_at)}</strong>
            </div>

            <div className="event-info-box">
              <span className="event-info-label">Event Date</span>
              <strong>{formatDateAndTime(eventDate)}</strong>
            </div>

            <div className="event-info-box">
              <span className="event-info-label">Location</span>
              <strong>{event.location || 'No location'}</strong>
            </div>

            <div className="event-info-box">
              <span className="event-info-label">Important</span>
              <strong>{event.isImportant ? 'Yes' : 'No'}</strong>
            </div>

            <div className="event-info-box">
              <span className="event-info-label">Website</span>
              {event.website ? (
                <a href={event.website} target="_blank" rel="noreferrer">
                  Visit Website
                </a>
              ) : (
                <strong>No website</strong>
              )}
            </div>

            <div className="event-info-box">
              <span className="event-info-label">Stars</span>
              <strong>{event.numOfStars ?? 0}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EventDetailsPage;