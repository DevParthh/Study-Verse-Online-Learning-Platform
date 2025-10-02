import { useState, useEffect } from 'react';
import courseService from '../services/courseService';

const EducatorDashboard = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the new course form
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  
  // State to manage which course is currently being edited
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const data = await courseService.getMyCourses();
        setMyCourses(data);
      } catch (err) {
        setError('Failed to fetch your courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  // --- Handlers for CREATING a new course ---
  const handleNewCourseChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleNewCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdCourse = await courseService.createCourse(newCourse);
      setMyCourses([createdCourse, ...myCourses]);
      setNewCourse({ title: '', description: '' });
      alert('Course created successfully! It is now pending approval.');
    } catch (err) {
      alert('Failed to create course.');
      console.error(err);
    }
  };

  // --- Handler for DELETING a course ---
  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        setMyCourses(myCourses.filter((course) => course.id !== courseId));
        alert('Course deleted successfully.');
      } catch (err) {
        alert('Failed to delete course.');
        console.error(err);
      }
    }
  };

  // --- Handlers for UPDATING an existing course ---
  const handleEditClick = (course) => {
    setEditingCourse({ ...course });
  };

  const handleEditChange = (e) => {
    setEditingCourse({ ...editingCourse, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await courseService.updateCourse(editingCourse.id, {
        title: editingCourse.title,
        description: editingCourse.description,
      });
      setMyCourses(myCourses.map(course => (course.id === updated.id ? updated : course)));
      setEditingCourse(null);
      alert('Course updated successfully!');
    } catch (err) {
      alert('Failed to update course.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading your courses...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Educator Dashboard</h2>

      {/* Create Course Form */}
      <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
        <h3>Create a New Course</h3>
        <form onSubmit={handleNewCourseSubmit}>
          <input
            type="text"
            name="title"
            value={newCourse.title}
            onChange={handleNewCourseChange}
            placeholder="Course Title"
            required
          />
          <br />
          <textarea
            name="description"
            value={newCourse.description}
            onChange={handleNewCourseChange}
            placeholder="Course Description"
            required
          />
          <br />
          <button type="submit">Create Course</button>
        </form>
      </div>

      <h3>My Courses</h3>
      {myCourses.map((course) => (
        <div key={course.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          {editingCourse && editingCourse.id === course.id ? (
            // --- EDIT FORM VIEW ---
            <form onSubmit={handleUpdateSubmit}>
              <input
                type="text"
                name="title"
                value={editingCourse.title}
                onChange={handleEditChange}
              />
              <br />
              <textarea
                name="description"
                value={editingCourse.description}
                onChange={handleEditChange}
              />
              <br />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingCourse(null)}>Cancel</button>
            </form>
          ) : (
            // --- DISPLAY VIEW ---
            <div>
              <h4>{course.title}</h4>
              <p>{course.description}</p>
              <p><strong>Status:</strong> {course.status}</p>
              <button onClick={() => handleEditClick(course)}>Edit</button>
              <button onClick={() => handleDelete(course.id)} style={{ color: 'red' }}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EducatorDashboard;