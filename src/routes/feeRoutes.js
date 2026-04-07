const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { listFees, createFee } = require('../controllers/feeController');

const router = express.Router();

router.get('/fees', authMiddleware, asyncHandler(listFees));
router.post('/fees', authMiddleware, requireAdmin, asyncHandler(createFee));

module.exports = router;
