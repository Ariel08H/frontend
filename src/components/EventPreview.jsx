import React from 'react';
import { Link } from 'react-router-dom';

const style = `
.card {
  position: relative;
  width: 320px;
  height: 220px;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  display: block;
  text-decoration: none;
  color: inherit;
  background: #1f2937;
}

/* IMAGE */
.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* FALLBACK WHEN NO IMAGE */
.cardNoImage {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #374151, #111827);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

/* CORNERS */
.card::before,
.card::after {
  position: absolute;
  content: "";
  width: 20%;
  height: 20%;
  background-color: rgba(0,0,0,0.6);
  transition: all 0.4s ease;
  z-index: 2;
}

.card::before {
  top: 0;
  right: 0;
  border-radius: 0 15px 0 100%;
}

.card::after {
  bottom: 0;
  left: 0;
  border-radius: 0 100% 0 15px;
}

/* EXPAND ON HOVER */
.card:hover::before,
.card:hover::after {
  width: 100%;
  height: 100%;
  border-radius: 15px;
}

/* CONTENT OVERLAY */
.cardContent {
  position: absolute;
  inset: 0;
  z-index: 3;
  color: white;
  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  text-align: center;
  padding: 15px;
  transition: opacity 0.3s ease;
}

.card:hover .cardContent {
  opacity: 1;
}

/* TEXT */
.cardTitle {
  font-size: 20px;
  font-weight: bold;
}

.cardDesc {
  font-size: 14px;
  max-height: 45px;
  overflow: hidden;
}

.cardDate {
  font-size: 13px;
  opacity: 0.9;
}

.cardLocation {
  font-size: 13px;
  opacity: 0.9;
}

.cardAuthor {
  font-size: 13px;
  opacity: 0.85;
}

.cardImportant {
  font-size: 14px;
  font-weight: 600;
}
`;

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
    <>
      <style>{style}</style>

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
    </>
  );
};

export default EventPreview;