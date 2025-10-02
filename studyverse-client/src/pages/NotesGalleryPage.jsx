import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext'; // Import useSearch
import noteService from '../services/noteService';
import searchService from '../services/searchService';
import './NotesGalleryPage.css';

const NotesGalleryPage = () => {
  const { user } = useAuth();
  const [allNotes, setAllNotes] = useState([]);
  const { setSearchConfig, results, setResults, isLoading } = useSearch(); // Use the shared context
  const [error, setError] = useState('');

  // Configure the search bar for this page
  useEffect(() => {
    setSearchConfig({
      isVisible: true,
      placeholder: 'Search for notes...',
      onSearch: searchService.searchNotes,
    });
    return () => {
      setSearchConfig({ isVisible: false });
      setResults(null);
    };
  }, [setSearchConfig, setResults]);

  // Fetch all notes on initial load
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await noteService.getStandaloneNotes();
        setAllNotes(data);
      } catch (err) {
        setError('Failed to fetch notes.');
        console.error(err);
      }
    };
    fetchNotes();
  }, []);

  const notesToDisplay = results || allNotes;

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <h2>Standalone Notes Gallery</h2>
        {user && (
          <Link to="/upload-note">
            <button style={{ padding: '8px 15px' }}>+ Upload Your Notes</button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <p>Searching...</p>
      ) : notesToDisplay.length > 0 ? (
        <div className="notes-container">
          {notesToDisplay.map((note) => (
            <Link to={`/notes/${note.id}`} key={note.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="note-card">
                 <img src={note.image_url ? `http://localhost:5000/${note.image_url}` : 'https://via.placeholder.com/280x160'} alt={note.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div className="note-card-content">
                  <h3>{note.title}</h3>
                  <p className="rating">
                    ⭐ {parseFloat(note.average_rating).toFixed(1)} 
                    <span style={{ color: '#888' }}> ({note.rating_count} ratings)</span>
                  </p>
                  <p className="cta">View Details & Reviews</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No notes found.</p>
      )}
    </div>
  );
};

export default NotesGalleryPage;