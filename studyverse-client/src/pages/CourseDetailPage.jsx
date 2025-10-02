import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import courseService from '../services/courseService';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [courseData, lessonsData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getLessonsForCourse(id),
        ]);
        setCourse(courseData);
        setLessons(lessonsData);
      } catch (err) {
        setError('Failed to fetch course details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!course) return <div>Course not found.</div>;

  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <p><strong>Rating:</strong> {course.average_rating} ({course.rating_count} ratings)</p>
      <hr />
      <h3>Lessons</h3>
      {lessons.length > 0 ? (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>{lesson.title}</li>
          ))}
        </ul>
      ) : (
        <p>No lessons available for this course yet.</p>
      )}
    </div>
  );
};

export default CourseDetailPage;