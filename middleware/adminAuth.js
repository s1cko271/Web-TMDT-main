const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

// Middleware để xác thực và kiểm tra quyền admin
const verifyAdmin = (req, res, next) => {
  try {
  // Lấy token từ header
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
  }

  try {
    // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token nhận được:', token);
      console.log('Decoded user:', decoded.user);
      
      // Kiểm tra quyền admin (chấp nhận true, 1, '1', 'true')
      const isAdmin = decoded.user.is_admin;
      if (!(isAdmin === true || isAdmin === 1 || isAdmin === "1" || isAdmin === "true")) {
        return res.status(403).json({ message: 'Bạn không có quyền admin' });
    }
    
      req.user = decoded.user;
      next();
    } catch (verifyError) {
      // Xử lý lỗi token hết hạn
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn, vui lòng đăng nhập lại' });
    }
      throw verifyError;
    }
  } catch (err) {
    console.error('Lỗi xác thực admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { verifyAdmin };