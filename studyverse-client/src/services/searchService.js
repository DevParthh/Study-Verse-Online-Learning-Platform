import axios from 'axios';

const API_URL = 'http://localhost:5000/api/search';

const searchCourses = async (query) => {
  const response = await axios.get(`${API_URL}/courses?q=${query}`);
  return response.data;
};

const searchNotes = async (query) => {
  const response = await axios.get(`${API_URL}/notes?q=${query}`);
  return response.data;
};

const searchService = {
  searchCourses,
  searchNotes,
};

export default searchService;