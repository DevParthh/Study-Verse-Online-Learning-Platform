import { useState, useEffect } from 'react'; // Make sure useEffect is imported
import enrollmentService from '../services/enrollmentService';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext'; // Import useSearch

const StudentDashboard = () => {
  const { setSearchConfig } = useSearch(); // Get the config function
  useEffect(() => {
    setSearchConfig({ isVisible: false }); // Hide search bar on this page
  }, [setSearchConfig]);

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const data = await enrollmentService.getMyEnrollments();
        setEnrolledCourses(data);
      } catch (err) {
        setError('Failed to fetch your enrolled courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) return <div>Loading your courses...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Student Dashboard</h2>
      <h3>My Enrolled Courses</h3>
      {enrolledCourses.length > 0 ? (
        <div>
          {enrolledCourses.map((course) => (
            <Link to={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <h4>{course.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>You have not enrolled in any courses yet.</p>
      )}
    </div>
  );
};

export default StudentDashboard;