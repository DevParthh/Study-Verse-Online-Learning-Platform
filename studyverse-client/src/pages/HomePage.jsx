import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext'; // Import useSearch
import courseService from '../services/courseService';
import searchService from '../services/searchService';
import './HomePage.css';

const HomePage = () => {
  const [allCourses, setAllCourses] = useState([]);
  const { setSearchConfig, results, setResults, isLoading } = useSearch(); // Use the shared context
  const [error, setError] = useState('');

  // Configure the search bar for this page when it loads
  useEffect(() => {
    setSearchConfig({
      isVisible: true,
      placeholder: 'Search for courses...',
      onSearch: searchService.searchCourses,
    });
    // Cleanup function to hide search bar when we leave the page
    return () => {
      setSearchConfig({ isVisible: false });
      setResults(null); // Clear results when leaving
    };
  }, [setSearchConfig, setResults]);

  // Fetch all courses on initial load
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setAllCourses(data);
      } catch (err) {
        setError('Failed to fetch courses.');
        console.error(err);
      }
    };
    fetchCourses();
  }, []);
  
  // Decide which list of courses to display
  const coursesToDisplay = results || allCourses;

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Available Courses</h2>
      {isLoading ? (
        <p>Searching...</p>
      ) : coursesToDisplay.length > 0 ? (
        <div className="courses-container">
          {coursesToDisplay.map((course) => (
             <Link to={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none', color: 'inherit' }}>
             <div className="course-card">
               <img src={course.image_url || 'https://via.placeholder.com/280x160'} alt={course.title} />
               <div className="course-card-content">
                 <h3>{course.title}</h3>
                 <p className="author">{course.teacher_name}</p>
                 <p className="rating">
                   ⭐ {parseFloat(course.average_rating).toFixed(1)} 
                   <span style={{ color: '#888' }}> ({course.rating_count} ratings)</span>
                 </p>
                 <p className="price">
                   {parseFloat(course.price) === 0 ? 'FREE' : `₹${course.price}`}
                 </p>
               </div>
             </div>
           </Link>
          ))}
        </div>
      ) : (
        <p>No courses found.</p>
      )}
    </div>
  );
};

export default HomePage;