import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <main className="about-page">
      <section className="about-box">
        <p className="about-tag">About Evently</p>

        <h1>Find and share events around you</h1>

        <p>
          Evently is a simple place where people can upload events, explore
          what is happening nearby, and keep track of events they care about.
        </p>

        <p>
          You can create an event with a title, description, image, date, time,
          location, and website link. Other users can then open the event page
          and see all the important details in one place.
        </p>

        <div className="about-actions">
          <Link to="/" className="about-btn">
            Explore Events
          </Link>

          <Link to="/create" className="about-btn secondary">
            Create Event
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;