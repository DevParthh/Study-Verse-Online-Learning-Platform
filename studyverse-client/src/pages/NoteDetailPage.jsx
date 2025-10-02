import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import noteService from '../services/noteService';

const NoteDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [note, setNote] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the new review form
    const [newRating, setNewRating] = useState('5');
    const [newReviewText, setNewReviewText] = useState('');

    const fetchNoteData = async () => {
        try {
            setLoading(true); // Ensure loading is true at the start of a fetch
            const [noteData, reviewsData] = await Promise.all([
                noteService.getNoteById(id),
                noteService.getReviewsForNote(id),
            ]);
            setNote(noteData);
            setReviews(reviewsData);
        } catch (err) {
            setError('Failed to fetch note details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNoteData();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReviewText.trim()) {
            alert('Please enter a review text.');
            return;
        }

        try {
            const ratingData = {
                rating_value: parseInt(newRating),
                review: newReviewText,
            };
            await noteService.rateAndReviewNote(id, ratingData);
            setNewRating('5');
            setNewReviewText('');
            fetchNoteData(); // Refresh reviews and average rating
        } catch (err) {
            alert('Failed to submit review.');
            console.error(err);
        }
    };

    const handlePurchase = async () => {
        if (window.confirm(`Are you sure you want to purchase these notes for ₹${note.price}?`)) {
            try {
                const response = await noteService.purchaseNote(id);
                alert(response.msg || 'Purchase successful!');
                // You could add logic here to hide the button or show an ownership message
            } catch (err) {
                alert(err.response?.data?.message || 'Purchase failed.');
                console.error(err);
            }
        }
    };

    if (loading) return <div>Loading note...</div>;
    if (error) return <div>{error}</div>;
    if (!note) return <div>Note not found.</div>;

    const fileUrl = note.file_url.startsWith('http') ? note.file_url : `http://localhost:5000/${note.file_url}`;

    return (
        <div>
            <h2>{note.title}</h2>
            <p>{note.description}</p>
            <p><strong>Average Rating:</strong> {parseFloat(note.average_rating).toFixed(2)} ({note.rating_count} ratings)</p>

            {/* --- PURCHASE BUTTON --- */}
            <div style={{ margin: '20px 0' }}>
                {user && user.id !== note.uploader_id && (
                    <button onClick={handlePurchase} style={{ padding: '10px 20px', fontSize: '16px' }}>
                        Purchase for {parseFloat(note.price) === 0 ? 'FREE' : `₹${note.price}`}
                    </button>
                )}
            </div>

            {/* Embedded PDF Viewer */}
            <div style={{ border: '1px solid #ccc', marginTop: '20px' }}>
                <iframe src={fileUrl} width="100%" height="600px" title={note.title}></iframe>
            </div>

            <hr style={{ margin: '30px 0' }} />

            <h3>Reviews</h3>
            {user ? (
                <div style={{ border: '1px solid #eee', padding: '15px', margin: '15px 0' }}>
                    <h4>Leave a Review</h4>
                    <form onSubmit={handleReviewSubmit}>
                        <div style={{ marginBottom: '10px' }}>
                            <label htmlFor="rating" style={{ marginRight: '10px' }}>Rating:</label>
                            <select id="rating" value={newRating} onChange={(e) => setNewRating(e.target.value)}>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                        <textarea
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            placeholder="Share your thoughts on these notes..."
                            style={{ width: '100%', minHeight: '80px', display: 'block', marginBottom: '10px' }}
                            required
                        />
                        <button type="submit">Submit Review</button>
                    </form>
                </div>
            ) : (
                <p>You must be logged in to leave a review.</p>
            )}

            <h4>Existing Reviews</h4>
            {reviews.length > 0 ? (
                reviews.map((review, index) => (
                    <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                        <p><strong>{review.author_name}</strong> rated it <strong>{review.rating_value} stars</strong>:</p>
                        <p>{review.review}</p>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}
        </div>
    );
};

export default NoteDetailPage;