const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy; // Tạm thời bỏ Facebook
const { pool } = require('./db');
const jwt = require('jsonwebtoken');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const [existingUser] = await pool.query(
        'SELECT * FROM users WHERE google_id = ? OR email = ?',
        [profile.id, profile.emails[0].value]
      );

      if (existingUser.length > 0) {
        // Update existing user if needed
        if (!existingUser[0].google_id) {
          await pool.query(
            'UPDATE users SET google_id = ?, provider = ? WHERE id = ?',
            [profile.id, 'google', existingUser[0].id]
          );
        }
        return done(null, existingUser[0]);
      }

      // Create new user
      const [result] = await pool.query(
        `INSERT INTO users (name, email, google_id, provider, avatar_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          profile.displayName,
          profile.emails[0].value,
          profile.id,
          'google',
          profile.photos[0]?.value
        ]
      );

      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      done(null, newUser[0]);
    } catch (error) {
      done(error, null);
    }
  }
));

// Tạm thời bỏ Facebook Strategy

// Generate JWT token for social login
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      provider: user.provider
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = { passport, generateToken }; 