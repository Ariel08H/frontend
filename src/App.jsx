import { useEffect, useState } from 'react';
import './App.css';
import { Outlet, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import CreateTestPage from './pages/CreateEventPage';
import AboutPage from './pages/AboutPage';
import EventDetailsPage from './pages/EventDetailsPage';
import Header from './components/Header';
import UserEventsPage from './pages/UserEventsPage';
import ShowcasePage from './pages/ShowcasePage';
import EventList from './components/EventList';

function App() {
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('my-favs8')) || [];
  });

  useEffect(() => {
    localStorage.setItem('my-favs8', JSON.stringify(favorites));
  }, [favorites]);

  return (
    <Routes>
      <Route
        element={
          <>
            <Header />
            <Outlet context={{ favorites, setFavorites }} />
          </>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateTestPage />} />
        <Route path="/edit/:id" element={<CreateTestPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/user-events" element={<UserEventsPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="/event/:id" element={<EventDetailsPage />} />
        <Route path="/favorites" element={<EventList showFavoritesOnly={true} />} />
      </Route>
    </Routes>
  );
}

export default App;