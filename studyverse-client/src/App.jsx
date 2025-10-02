import { Outlet, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // We get our hook from the context file

function App() {
  // Get the user state and the logout function from our global context
  const { user, logout } = useAuth();

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>

        {user ? (
          // If user is logged in, show this:
          <>
            <span> | Welcome! </span>
              {user.role === 'educator' && (
                <Link to="/dashboard/educator">Educator Dashboard</Link>
              )}
              {user.role === 'student' && (
                <Link to="/dashboard/student">My Courses</Link>
              )}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          // If user is logged out, show this:
          <>
            | <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <hr />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;