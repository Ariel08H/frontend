import EventList from '../components/EventList';

const UserEventsPage = () => {
  return (
    <main>
      <h1>My Events</h1>
      <EventList showMyEvents={true} />
    </main>
  );
};

export default UserEventsPage;