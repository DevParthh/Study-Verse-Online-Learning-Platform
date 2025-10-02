import axios from 'axios';

const API_URL = 'http://localhost:5000/api/courses/';

// Get all approved courses
const getAllCourses = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get a single course by ID
const getCourseById = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data;
};

// Get lessons for a specific course
const getLessonsForCourse = async (courseId) => {
  const response = await axios.get(API_URL + courseId + '/lessons');
  return response.data;
};

const getMyCourses = async () => {
  // Get the user data (which includes the token) from local storage
  const user = JSON.parse(localStorage.getItem('user'));

  const config = {
    headers: {
      'x-auth-token': user.token, // Send the token in the header
    },
  };

  const response = await axios.get(API_URL + 'mycourses', config);
  return response.data;
};

// Create a new course <<< NEW
const createCourse = async (courseData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const config = {
    headers: {
      'x-auth-token': user.token,
    },
  };
  const response = await axios.post(API_URL, courseData, config);
  return response.data;
};

// Delete a course <<< NEW
const deleteCourse = async (courseId) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const config = {
    headers: {
      'x-auth-token': user.token,
    },
  };
  const response = await axios.delete(API_URL + courseId, config);
  return response.data;
};

const updateCourse = async (courseId, courseData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const config = {
    headers: {
      'x-auth-token': user.token,
    },
  };
  const response = await axios.put(API_URL + courseId, courseData, config);
  return response.data;
};


const courseService = {
  getAllCourses,
  getCourseById,
  getLessonsForCourse,
  getMyCourses, 
  createCourse,
  deleteCourse,
  updateCourse
};

export default courseService;