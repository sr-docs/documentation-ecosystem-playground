const express = require('express');
const router = express.Router();

// GET /auth/sessions
// Returns the authenticated user's active sessions.
router.get('/auth/sessions', authenticate, async (req, res) => {
  const limit = req.query.limit !== undefined
    ? parseInt(req.query.limit, 10)
    : 20;

  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'invalid_request',
      message: 'limit must be a number between 1 and 100',
    });
  }

  const activeOnly = req.query.active_only !== 'false';

  const sessions = await sessionStore.list({
    userId: req.user.id,
    limit,
    activeOnly,
  });

  res.status(200).json({
    sessions: sessions.map(toSessionResponse),
  });
});

function toSessionResponse(session) {
  return {
    session_id: session.id,
    device: session.device,
    ip_address: session.ipAddress,
    created_at: session.createdAt.toISOString(),
    last_active_at: session.lastActiveAt.toISOString(),
    current: session.isCurrent,
  };
}

module.exports = router;
