const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdmin() {
  try {
    // Kết nối database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Kiểm tra tài khoản admin
    const [users] = await connection.execute(
      'SELECT id, email, is_admin, name FROM users WHERE email = ?',
      ['admin@example.com']
    );

    if (users.length === 0) {
      console.log('❌ Không tìm thấy tài khoản admin@example.com trong database');
    } else {
      console.log('✅ Tìm thấy tài khoản admin:');
      console.log(users[0]);
      
      // Kiểm tra và sửa quyền admin nếu cần
      if (!users[0].is_admin) {
        console.log('❌ Tài khoản không có quyền admin, đang cập nhật...');
        await connection.execute(
          'UPDATE users SET is_admin = 1 WHERE email = ?',
          ['admin@example.com']
        );
        console.log('✅ Đã cập nhật quyền admin thành công');
      } else {
        console.log('✅ Tài khoản đã có quyền admin');
      }
      
      // Kiểm tra trường name
      if (!users[0].name) {
        console.log('❌ Tài khoản không có tên, đang cập nhật...');
        await connection.execute(
          'UPDATE users SET name = "Admin" WHERE email = ?',
          ['admin@example.com']
        );
        console.log('✅ Đã cập nhật tên thành công');
      }
    }

    await connection.end();
  } catch (error) {
    console.error('Lỗi khi kiểm tra tài khoản admin:', error);
  }
}

checkAdmin(); 