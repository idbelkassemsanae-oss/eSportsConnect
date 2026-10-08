import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RouterProvider, usePage } from './context/RouterContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import CreateTournament from './pages/CreateTournament';
import EditTournament from './pages/EditTournament';
import ManageTournament from './pages/ManageTournament';
import MyTournaments from './pages/MyTournaments';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CoachCourses from './pages/CoachCourses';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CoachRequests from './pages/CoachRequests';
import MyCourses from './pages/MyCourses';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import GameProfile from './pages/GameProfile';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import ResourceForm from './pages/ResourceForm';
import Streaming from './pages/Streaming';
import DashboardIA from './pages/DashboardIA';
import CoachDashboard from './pages/CoachDashboard';
import StreamDetail from './pages/StreamDetail';

const RouterContent = () => {
  const page = usePage();

  // Routes sans ID
  if (page === 'login') return <Login />;
  if (page === 'register') return <Register />;
  if (page === 'home') return <><Navbar /><Home /><Footer /></>;
  if (page === 'dashboard') return <><Navbar /><PlayerDashboard /><Footer /></>;
  if (page === 'profile') return <><Navbar /><Profile /><Footer /></>;
  if (page === 'game-profile') return <><Navbar /><GameProfile /><Footer /></>;
  if (page === 'courses') return <><Navbar /><Courses /><Footer /></>;
  if (page === 'my-courses') return <><Navbar /><MyCourses /><Footer /></>;
  if (page === 'coach-courses') return <><Navbar /><CoachCourses /><Footer /></>;
  if (page === 'create-course') return <><Navbar /><CreateCourse /><Footer /></>;
  if (page === 'coach-requests') return <><Navbar /><CoachRequests /><Footer /></>;
  if (page === 'tournaments') return <><Navbar /><Tournaments /><Footer /></>;
  if (page === 'create-tournament') return <><Navbar /><CreateTournament /><Footer /></>;
  if (page === 'my-tournaments') return <><Navbar /><MyTournaments /><Footer /></>;
  if (page === 'leaderboard') return <><Navbar /><Leaderboard /><Footer /></>;
  if (page === 'inbox') return <><Navbar /><Inbox /><Footer /></>;
  if (page === 'resources') return <><Navbar /><Resources /><Footer /></>;
  if (page === 'create-resource') return <><Navbar /><ResourceForm /><Footer /></>;
  if (page === 'streaming') return <><Navbar /><Streaming /><Footer /></>;
  if (page === 'dashboard-ia') return <><Navbar /><DashboardIA /><Footer /></>;
  if (page === 'coach-dashboard') return <><Navbar /><CoachDashboard /><Footer /></>;

  // Routes avec ID
  if (page.startsWith('course-detail/')) return <><Navbar /><CourseDetail /><Footer /></>;
  if (page.startsWith('edit-course/')) return <><Navbar /><EditCourse /><Footer /></>;
  if (page.startsWith('coach-requests/')) return <><Navbar /><CoachRequests /><Footer /></>;
  if (page.startsWith('tournaments/')) return <><Navbar /><TournamentDetail /><Footer /></>;
  if (page.startsWith('manage-tournament/')) return <><Navbar /><ManageTournament /><Footer /></>;
  if (page.startsWith('edit-tournament/')) return <><Navbar /><EditTournament /><Footer /></>;
  if (page.startsWith('resource/')) return <><Navbar /><ResourceDetail /><Footer /></>;
  if (page.startsWith('edit-resource/')) return <><Navbar /><ResourceForm /><Footer /></>;
  if (page.startsWith('streaming/')) return <><Navbar /><StreamDetail /><Footer /></>;

  return <><Navbar /><Home /><Footer /></>;
};

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ThemeProvider>
          <RouterContent />
          <ChatbotWidget />
        </ThemeProvider>
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;