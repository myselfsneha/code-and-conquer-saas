const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { listCourses, createCourse, deleteCourse } = require('../controllers/courseController');

const router = express.Router();

router.get('/courses', authMiddleware, asyncHandler(listCourses));
router.post('/courses', authMiddleware, requireAdmin, asyncHandler(createCourse));
router.delete('/courses/:id', authMiddleware, requireAdmin, asyncHandler(deleteCourse));

module.exports = router;
