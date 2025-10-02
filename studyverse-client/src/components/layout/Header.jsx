import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext'; // 1. Import useSearch
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  // 2. Get everything we need from the SearchContext
  const { searchConfig, query, setQuery, executeSearch } = useSearch();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <header className="app-header">
      <div className="header-logo">
        <Link to="/">StudyVerse</Link>
      </div>

      {/* 3. Conditionally render the search bar */}
      {searchConfig.isVisible && (
        <div className="header-search">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder={searchConfig.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>
      )}

      <nav className="header-nav">
        {/* The "Home" link has been removed */}
        <Link to="/notes">Notes Gallery</Link>
        {user ? (
          <>
            {user.role === 'student' && <Link to="/dashboard/student">My Courses</Link>}
            {user.role === 'educator' && <Link to="/dashboard/educator">Dashboard</Link>}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;