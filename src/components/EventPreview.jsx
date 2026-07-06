import React from 'react';
import { Link } from 'react-router-dom';

const EventPreview = ({ event }) => {
  const eventDate = event.date || event.last_date;

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No date';

  return (
    <Link to={`/event/${event.id}`} className="card">
      {event.img ? (
        <img src={event.img} alt={event.title || 'Event image'} />
      ) : (
        <div className="cardNoImage">No Image</div>
      )}

      <div className="cardContent">
        <div className="cardTitle">{event.title || 'Untitled Event'}</div>

        <div className="cardDesc">
          {event.description || 'No description'}
        </div>

        <div className="cardDate">{formattedDate}</div>

        <div className="cardLocation">
          📍 {event.location || 'No location'}
        </div>

        {event.isImportant && (
          <div className="cardImportant">⭐ Important</div>
        )}

        <div className="cardAuthor">
          {event.author || 'Anonymous'}
        </div>
      </div>
    </Link>
  );
};

export default EventPreview;