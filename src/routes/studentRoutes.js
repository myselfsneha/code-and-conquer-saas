const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { listStudents, createStudent, deleteStudent } = require('../controllers/studentController');

const router = express.Router();

router.get('/students', authMiddleware, asyncHandler(listStudents));
router.post('/students', authMiddleware, requireAdmin, asyncHandler(createStudent));
router.delete('/students/:id', authMiddleware, requireAdmin, asyncHandler(deleteStudent));

module.exports = router;
