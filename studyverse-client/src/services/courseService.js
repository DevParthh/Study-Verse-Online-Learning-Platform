import axios from 'axios';

const API_URL = 'http://localhost:5000/api/courses/';

// --- Helper to get auth token ---
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { 'x-auth-token': user.token };
  }
  return {};
};

// --- Existing Functions ---
const getAllCourses = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getCourseById = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data;
};

const getLessonsForCourse = async (courseId) => {
  const response = await axios.get(API_URL + courseId + '/lessons');
  return response.data;
};

const getMyCourses = async () => {
  const response = await axios.get(API_URL + 'mycourses', { headers: getAuthHeaders() });
  return response.data;
};

const createCourse = async (courseData) => {
  const response = await axios.post(API_URL, courseData, { headers: getAuthHeaders() });
  return response.data;
};

const deleteCourse = async (courseId) => {
  const response = await axios.delete(API_URL + courseId, { headers: getAuthHeaders() });
  return response.data;
};

const updateCourse = async (courseId, courseData) => {
  const response = await axios.put(API_URL + courseId, courseData, { headers: getAuthHeaders() });
  return response.data;
};


// <<< --- NEW FUNCTIONS START HERE --- >>>

// Get all comments for a specific course
const getCommentsForCourse = async (courseId) => {
  const response = await axios.get(API_URL + courseId + '/comments');
  return response.data;
};

// Add a new comment to a course
const addCommentToCourse = async (courseId, commentText) => {
  const response = await axios.post(
    API_URL + courseId + '/comments',
    { text: commentText }, // The API expects an object with a 'text' property
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Rate a course
const rateCourse = async (courseId, ratingValue) => {
  const response = await axios.post(
    API_URL + courseId + '/rate',
    { rating_value: ratingValue }, // The API expects an object with a 'rating_value' property
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const enrollInCourse = async (courseId) => {
  const response = await axios.post(
    API_URL + courseId + '/enroll',
    {}, // This endpoint doesn't require a body, so we send an empty object
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const courseService = {
  getAllCourses,
  getCourseById,
  getLessonsForCourse,
  getMyCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  getCommentsForCourse,   // <-- Add to export
  addCommentToCourse,     // <-- Add to export
  rateCourse,              // <-- Add to export
  enrollInCourse
};

export default courseService;