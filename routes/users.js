const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/email');
const { verifyToken } = require('../middleware/auth');

// Tạo bảng users nếu chưa tồn tại
async function setupUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (email)
      )
    `);

    console.log('Users table setup completed');
  } catch (error) {
    console.error('Error setting up users table:', error.message);
  }
}

// Gọi hàm setup khi khởi động server
setupUsersTable();

// POST register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if user already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const query = `
      INSERT INTO users (name, email, password, address, phone)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [name, email, hashedPassword, address || null, phone || null]);

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // Tạo đối tượng user để gửi email
    const user = {
      id: result.insertId,
      name,
      email,
      address,
      phone
    };

    // Gửi email xác nhận đăng ký
    try {
      await emailService.sendRegistrationEmail(user);
      console.log(`Email xác nhận đăng ký đã được gửi đến ${email}`);
    } catch (emailError) {
      console.error('Không thể gửi email xác nhận đăng ký:', emailError);
      // Không trả về lỗi cho người dùng, chỉ ghi log lỗi
    }

    // Tạo đối tượng user để gửi email
    const userForEmail = {
      id: result.insertId,
      name,
      email,
      address,
      phone
    };

    // Gửi email xác nhận đăng ký
    try {
      await emailService.sendRegistrationEmail(userForEmail);
      console.log(`Email xác nhận đăng ký đã được gửi đến ${email}`);
    } catch (emailError) {
      console.error('Không thể gửi email xác nhận đăng ký:', emailError);
      // Không trả về lỗi cho người dùng, chỉ ghi log lỗi
    }

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get user without password
    const [users] = await pool.query(
      'SELECT id, name, email, address, phone, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update user profile
router.put('/profile/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own profile
    if (req.user.id != id) {
      return res.status(403).json({ message: 'Bạn chỉ có thể cập nhật hồ sơ của chính mình' });
    }
    
    const { name, address, phone } = req.body;

    // Check if user exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const query = `
      UPDATE users
      SET name = ?, address = ?, phone = ?
      WHERE id = ?
    `;

    await pool.query(query, [
      name || existingUser[0].name,
      address !== undefined ? address : existingUser[0].address,
      phone !== undefined ? phone : existingUser[0].phone,
      id
    ]);

    // Get updated user
    const [updatedUser] = await pool.query(
      'SELECT id, name, email, address, phone, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT change password
router.put('/change-password/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is changing their own password
    if (req.user.id != id) {
      return res.status(403).json({ message: 'Bạn chỉ có thể thay đổi mật khẩu của chính mình' });
    }
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    // Gửi email thông báo thay đổi mật khẩu
    try {
      const emailOptions = {
        subject: 'Thông báo thay đổi mật khẩu',
        html: `
          <h2>Xin chào ${user.name},</h2>
          <p>Mật khẩu tài khoản của bạn vừa được thay đổi thành công.</p>
          <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ</p>
        `
      };
      await emailService.sendEmail(user.email, emailOptions.subject, emailOptions.html);
    } catch (emailError) {
      console.error('Không thể gửi email thông báo thay đổi mật khẩu:', emailError);
      // Không trả về lỗi cho người dùng, chỉ ghi log lỗi
    }

    res.json({ message: 'Mật khẩu đã được cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi thay đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;