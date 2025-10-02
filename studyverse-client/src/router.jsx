import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx'; // <<< NEW IMPORT

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import EducatorDashboard from './pages/EducatorDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';

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