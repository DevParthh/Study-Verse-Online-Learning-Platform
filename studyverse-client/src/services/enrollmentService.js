import axios from 'axios';

const API_URL = 'http://localhost:5000/api/enrollments/';

// Get courses for the logged-in student
const getMyEnrollments = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const config = {
    headers: {
      'x-auth-token': user.token,
    },
  };

  const response = await axios.get(API_URL + 'my-enrollments', config);
  return response.data;
};

const enrollmentService = {
  getMyEnrollments,
};

export default enrollmentService;