const express = require('express');
const router = express.Router();
const { passport, generateToken } = require('../config/passport');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// Tạm thời bỏ Facebook OAuth routes

module.exports = router; 