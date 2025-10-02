import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes/';

// --- Helper to get auth token ---
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { 'x-auth-token': user.token };
  }
  return {};
};


// --- Existing Functions ---

const getStandaloneNotes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getNotesForCourse = async (courseId) => {
  const response = await axios.get(API_URL + 'course/' + courseId);
  return response.data;
};


// <<< --- NEW FUNCTIONS START HERE --- >>>

// Get a single standalone note by its ID
const getNoteById = async (noteId) => {
    const response = await axios.get(API_URL + noteId);
    return response.data;
};

// Get all reviews for a specific note
const getReviewsForNote = async (noteId) => {
    const response = await axios.get(API_URL + noteId + '/reviews');
    return response.data;
};

// Post a rating and a review for a note
const rateAndReviewNote = async (noteId, ratingData) => {
    // ratingData should be an object like { rating_value: 5, review: "Great notes!" }
    const response = await axios.post(
        API_URL + noteId + '/rate',
        ratingData,
        { headers: getAuthHeaders() }
    );
    return response.data;
};

const uploadNote = async (formData) => {
    // For file uploads, we need to send the token and set the Content-Type header
    const config = {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        },
    };
    const response = await axios.post(API_URL, formData, config);
    return response.data;
};

const purchaseNote = async (noteId) => {
    const response = await axios.post(
        API_URL + noteId + '/purchase',
        {}, // No body needed
        { headers: getAuthHeaders() }
    );
    return response.data;
};

const noteService = {
  getStandaloneNotes,
  getNotesForCourse,
  getNoteById,          // <-- Add to export
  getReviewsForNote,    // <-- Add to export
  rateAndReviewNote,    // <-- Add to export
  uploadNote,
  purchaseNote
};

export default noteService;