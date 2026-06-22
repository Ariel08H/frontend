import { useState } from 'react'
import './App.css'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CreateTestPage from './pages/CreateEventPage'
import AboutPage from './pages/AboutPage'
import EventDetailsPage from './pages/EventDetailsPage'
import Header from './components/Header'
import TestList from './components/EventList'
import UserEventsPage from './pages/UserEventsPage'
import ShowcasePage from './pages/ShowcasePage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <Routes>
        <Route path='/' exact element={<Home />} />
        <Route path='/create' element={<CreateTestPage />} />
        <Route path="/edit/:id" element={<CreateTestPage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/user-events' element={<UserEventsPage />} />
        <Route path='/showcase' element={<ShowcasePage />} />
        <Route path='/event/:id' element={<EventDetailsPage />} />

      </Routes>


    </>
  )
}

export default App
