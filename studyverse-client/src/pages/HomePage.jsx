import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../services/courseService';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (err) {
        setError('Failed to fetch courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Available Courses</h2>
      {courses.length > 0 ? (
        <div>
          {courses.map((course) => (
            <Link to={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p>Rating: {course.average_rating} ({course.rating_count} ratings)</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No courses available at the moment.</p>
      )}
    </div>
  );
};

export default HomePage;