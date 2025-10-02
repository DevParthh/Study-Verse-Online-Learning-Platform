import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth(); // <-- GET isLoading FROM CONTEXT

  // 1. Wait until the initial loading is complete
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // 2. After loading, check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. After confirming login, check if the user has the correct role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div>
        <h2>Unauthorized</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // 4. If all checks pass, grant access
  return <Outlet />;
};

export default ProtectedRoute;