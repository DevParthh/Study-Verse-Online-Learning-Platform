import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import noteService from '../services/noteService';
import enrollmentService from '../services/enrollmentService';

const CourseDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();

    // State for course data
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [notes, setNotes] = useState([]);
    const [comments, setComments] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // State for user input
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState('5');

    // General state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllCourseData = async () => {
        try {
            const [courseData, lessonsData, notesData, commentsData] = await Promise.all([
                courseService.getCourseById(id),
                courseService.getLessonsForCourse(id),
                noteService.getNotesForCourse(id),
                courseService.getCommentsForCourse(id),
            ]);
            setCourse(courseData);
            setLessons(lessonsData);
            setNotes(notesData);
            setComments(commentsData);
        } catch (err) {
            setError('Failed to fetch course details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchAllCourseData();
    }, [id]);

    useEffect(() => {
        const checkEnrollment = async () => {
            if (user && user.role === 'student' && course) {
                try {
                    const myEnrollments = await enrollmentService.getMyEnrollments();
                    const isUserEnrolled = myEnrollments.some(enrolledCourse => enrolledCourse.id.toString() === id);
                    setIsEnrolled(isUserEnrolled);
                } catch (err) {
                    console.error("Could not verify enrollment status", err);
                }
            }
        };
        checkEnrollment();
    }, [user, course, id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await courseService.addCommentToCourse(id, newComment);
            setNewComment('');
            fetchAllCourseData();
        } catch (err) {
            alert('Failed to add comment. You must be enrolled to comment.');
            console.error(err);
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        try {
            await courseService.rateCourse(id, parseInt(rating));
            alert('Thank you for your rating!');
            fetchAllCourseData();
        } catch (err) {
            alert('Failed to submit rating. You must be enrolled to rate.');
            console.error(err);
        }
    };

    const handleEnroll = async () => {
        if (window.confirm(`Are you sure you want to purchase this course for $${course.price}?`)) {
            try {
                const response = await courseService.enrollInCourse(id);
                alert(response.msg || 'Enrollment successful!');
                setIsEnrolled(true);
            } catch (err) {
                alert(err.response?.data?.message || 'Enrollment failed. Please check your balance or try again.');
                console.error(err);
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!course) return <div>Course not found.</div>;

    return (
        <div>
            {/* --- COURSE DETAILS --- */}
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <p><strong>Rating:</strong> {parseFloat(course.average_rating).toFixed(2)} ({course.rating_count} ratings)</p>

            {/* --- ENROLLMENT BUTTON / STATUS --- */}
            <div style={{ margin: '20px 0' }}>
                {user && user.role === 'student' && (
                    isEnrolled ? (
                        <p style={{ color: 'green', fontWeight: 'bold' }}>✅ You are enrolled in this course.</p>
                    ) : (
                        <button onClick={handleEnroll} style={{ padding: '10px 20px', fontSize: '16px' }}>
                            Enroll for ${course.price}
                        </button>
                    )
                )}
            </div>
            <hr />

            {/* --- LESSONS LIST --- */}
            <h3>Lessons</h3>
            {lessons.length > 0 ? (
                <ul>{lessons.map((lesson) => <li key={lesson.id}>{lesson.title}</li>)}</ul>
            ) : (<p>No lessons available for this course yet.</p>)}
            <hr />

            {/* --- NOTES LIST --- */}
            <h3>Shared Notes</h3>
            {notes.length > 0 ? (
                <div>
                    {notes.map((note) => (
                        <Link to={`/notes/${note.id}`} key={note.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                                <h4>{note.title}</h4>
                                <p>{note.description || 'No description provided.'}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (<p>No notes have been shared for this course yet.</p>)}
            <hr />

            {/* --- RATING AND COMMENTS SECTION --- */}
            <h3>Ratings & Comments</h3>
            {user ? (
                <>
                    <div style={{ border: '1px solid #eee', padding: '15px', margin: '15px 0' }}>
                        <h4>Rate this Course</h4>
                        <form onSubmit={handleRatingSubmit}>
                            <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ marginRight: '10px' }}>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                            <button type="submit">Submit Rating</button>
                        </form>
                    </div>
                    <div style={{ border: '1px solid #eee', padding: '15px', margin: '15px 0' }}>
                        <h4>Leave a Comment</h4>
                        <form onSubmit={handleCommentSubmit}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                style={{ width: '100%', minHeight: '80px', display: 'block', marginBottom: '10px' }}
                            />
                            <button type="submit">Post Comment</button>
                        </form>
                    </div>
                </>
            ) : (<p>You must be logged in to rate or comment.</p>)}

            <h4>Existing Comments</h4>
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                        <p><strong>{comment.author_name}</strong> says:</p>
                        <p>{comment.text}</p>
                    </div>
                ))
            ) : (<p>No comments yet.</p>)}
        </div>
    );
};

export default CourseDetailPage;