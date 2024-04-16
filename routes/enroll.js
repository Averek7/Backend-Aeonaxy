const router = require("express").Router();
const db = require("../db/connection");
const verifyToken = require("../middleware/verifyToken");

router.post('/:courseId', verifyToken, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.userId;

        // Course Exists
        const course = await db.pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (course.rows.length === 0) {
            return res.status(400).json({ error: 'Course does not exist' });
        }

        // Already Enrolled
        const existingEnrollment = await db.pool.query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
        if (existingEnrollment.rows.length > 0) {
            return res.status(400).json({ error: 'User already enrolled in the course' });
        }

        await db.pool.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);

        res.status(201).json({ message: 'User enrolled in the course successfully' });
    } catch (error) {
        console.error('Error enrolling user in course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/enrolled', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        const enrolledCourses = await db.pool.query('SELECT courses.* FROM courses INNER JOIN enrollments ON courses.id = enrollments.course_id WHERE enrollments.user_id = $1', [userId]);
        
        res.json(enrolledCourses.rows);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;