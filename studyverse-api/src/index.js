// Load environment variables from .env file at the very top
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// Import and use the authentication routes <<< NEW LINE
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const noteRoutes = require('./routes/noteRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

app.get('/', (req, res) => {
    res.send('StudyVerse API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use(errorHandler);

// Use the PORT from the .env file, with a fallback to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});