const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    // Thông tin admin mới
    const adminInfo = {
      name: 'Admin',  // Tên admin
      email: 'admin@example.com',  // Email admin
      password: 'admin123',  // Mật khẩu admin
      phone: '0123456789',  // Số điện thoại (nếu cần)
      is_admin: true  // Phân quyền admin
    };

    // Kết nối database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'shopease_db'
    });

    // Kiểm tra xem email đã tồn tại chưa
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [adminInfo.email]
    );

    if (existingUsers.length > 0) {
      // Nếu email đã tồn tại, cập nhật quyền admin
      const [result] = await connection.execute(
        'UPDATE users SET is_admin = true WHERE email = ?',
        [adminInfo.email]
      );
      console.log('Đã cập nhật quyền admin cho tài khoản:', adminInfo.email);
    } else {
      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminInfo.password, salt);

      // Thêm tài khoản admin mới
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?)',
        [adminInfo.name, adminInfo.email, hashedPassword, adminInfo.phone, adminInfo.is_admin]
      );

      console.log('Đã tạo tài khoản admin mới:', adminInfo.email);
      console.log('ID:', result.insertId);
    }

    // Đóng kết nối
    await connection.end();
    console.log('Tài khoản admin đã sẵn sàng để sử dụng!');
    console.log('Email:', adminInfo.email);
    console.log('Mật khẩu:', adminInfo.password);
  } catch (error) {
    console.error('Lỗi khi tạo tài khoản admin:', error);
  }
}

createAdmin(); 