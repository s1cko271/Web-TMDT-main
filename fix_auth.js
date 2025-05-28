const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function fixAuth() {
  try {
    console.log('===== BẮT ĐẦU KIỂM TRA VÀ SỬA LỖI XÁC THỰC =====');
    
    // 1. Kết nối database
    console.log('🔄 Đang kết nối database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Kết nối database thành công');
    
    // 2. Kiểm tra bảng users có tồn tại không
    console.log('🔄 Đang kiểm tra bảng users...');
    try {
      const [tables] = await connection.query('SHOW TABLES LIKE "users"');
      if (tables.length === 0) {
        console.log('❌ Bảng users không tồn tại, đang tạo...');
        await connection.query(`
          CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            address VARCHAR(255),
            phone VARCHAR(20),
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ Đã tạo bảng users thành công');
      } else {
        console.log('✅ Bảng users đã tồn tại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra bảng users:', error.message);
    }

    // 3. Kiểm tra và tạo tài khoản admin
    console.log('🔄 Đang kiểm tra tài khoản admin...');
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@example.com']
    );

    if (users.length === 0) {
      console.log('❌ Không tìm thấy tài khoản admin, đang tạo...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await connection.query(
        'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@example.com', hashedPassword, true]
      );
      console.log('✅ Đã tạo tài khoản admin thành công');
    } else {
      console.log('✅ Tài khoản admin đã tồn tại');
      
      // Kiểm tra quyền admin
      if (!users[0].is_admin) {
        console.log('❌ Tài khoản không có quyền admin, đang cập nhật...');
        await connection.query(
          'UPDATE users SET is_admin = ? WHERE email = ?',
          [true, 'admin@example.com']
        );
        console.log('✅ Đã cập nhật quyền admin thành công');
      }
      
      // Kiểm tra tên
      if (!users[0].name) {
        console.log('❌ Tài khoản không có tên, đang cập nhật...');
        await connection.query(
          'UPDATE users SET name = ? WHERE email = ?',
          ['Admin', 'admin@example.com']
        );
        console.log('✅ Đã cập nhật tên thành công');
      }
    }
    
    // 4. Kiểm tra JWT token
    console.log('🔄 Đang kiểm tra JWT token...');
    const [admin] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@example.com']
    );
    
    const payload = {
      user: {
        id: admin[0].id,
        is_admin: true,
        name: admin[0].name || 'Admin'
      }
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ Tạo JWT token thành công:');
    console.log('🔑 Token:', token);
    
    // Giải mã token để kiểm tra
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Giải mã token thành công:');
    console.log(decoded);
    
    // 5. Kiểm tra và cập nhật JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.log('⚠️ Không tìm thấy JWT_SECRET trong .env, đang sử dụng giá trị mặc định');
    }
    
    console.log('===== HOÀN THÀNH KIỂM TRA VÀ SỬA LỖI XÁC THỰC =====');
    console.log('📝 Thông tin đăng nhập admin:');
    console.log('Email: admin@example.com');
    console.log('Mật khẩu: admin123');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

fixAuth(); 