import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import EducatorDashboard from './pages/EducatorDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import NotesGalleryPage from './pages/NotesGalleryPage.jsx';
import NoteDetailPage from './pages/NoteDetailPage.jsx';
import UploadNotePage from './pages/UploadNotePage.jsx'; // <<< 1. NEW IMPORT

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/courses/:id', element: <CourseDetailPage /> },
      { path: '/notes', element: <NotesGalleryPage /> },
      { path: '/notes/:id', element: <NoteDetailPage /> },

      // Protected Routes (all user roles)
      {
        element: <ProtectedRoute />, // No specific role, just needs login
        children: [
          { path: '/upload-note', element: <UploadNotePage /> }, // <<< 2. NEW ROUTE
        ],
      },
      
      // Educator-only routes
      {
        element: <ProtectedRoute allowedRoles={['educator']} />,
        children: [
          { path: '/dashboard/educator', element: <EducatorDashboard /> },
        ],
      },

      // Student-only routes
      {
        element: <ProtectedRoute allowedRoles={['student']} />,
        children: [
          { path: '/dashboard/student', element: <StudentDashboard /> },
        ],
      },
    ],
  },
]);

export default router;