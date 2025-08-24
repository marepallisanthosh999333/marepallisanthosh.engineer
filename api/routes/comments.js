const express = require('express');
const {
  getComments,
  addComment,
  toggleCommentLike,
  checkCommentLike
} = require('../controllers/comments.js');

const router = express.Router();

// GET /api/comments - Get all comments
router.get('/', getComments);

// POST /api/comments - Add new comment
router.post('/', addComment);

// POST /api/comments/:commentId/like - Toggle like on comment
router.post('/:commentId/like', toggleCommentLike);

// GET /api/comments/:commentId/like - Check if user has liked comment
router.get('/:commentId/like', checkCommentLike);

module.exports = router;
