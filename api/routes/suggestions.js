const express = require('express');
const {
  getSuggestions,
  addSuggestion,
  toggleSuggestionVote,
  checkSuggestionVote,
  updateSuggestionStatus
} = require('../controllers/suggestions.js');

const router = express.Router();

// GET /api/suggestions - Get all suggestions
router.get('/', getSuggestions);

// POST /api/suggestions - Add new suggestion
router.post('/', addSuggestion);

// POST /api/suggestions/:suggestionId/vote - Toggle vote on suggestion
router.post('/:suggestionId/vote', toggleSuggestionVote);

// GET /api/suggestions/:suggestionId/vote - Check if user has voted
router.get('/:suggestionId/vote', checkSuggestionVote);

// PUT /api/suggestions/:suggestionId/status - Update suggestion status (admin)
router.put('/:suggestionId/status', updateSuggestionStatus);

module.exports = router;
