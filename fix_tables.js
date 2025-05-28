const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTables() {
  try {
    console.log('===== KIỂM TRA VÀ TẠO CÁC BẢNG CẦN THIẾT =====');
    
    // Kết nối database
    console.log('🔄 Đang kết nối database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Kết nối database thành công');
    
    // Kiểm tra và tạo bảng categories nếu chưa tồn tại
    console.log('🔄 Đang kiểm tra bảng categories...');
    try {
      const [tables1] = await connection.query('SHOW TABLES LIKE "categories"');
      if (tables1.length === 0) {
        console.log('❌ Bảng categories chưa tồn tại, đang tạo...');
        await connection.query(`
          CREATE TABLE categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ Đã tạo bảng categories thành công');
        
        // Thêm dữ liệu mẫu
        await connection.query(`
          INSERT INTO categories (name, description, image_url) VALUES
          ('Văn phòng phẩm', 'Các loại dụng cụ văn phòng phẩm', '/images/categories/vanphongpham.jpg'),
          ('Sách giáo khoa', 'Sách giáo khoa các cấp', '/images/categories/sachgiaokhoa.jpg'),
          ('Dụng cụ học tập', 'Các loại dụng cụ học tập', '/images/categories/dungcuhoctap.jpg')
        `);
        console.log('✅ Đã thêm dữ liệu mẫu cho bảng categories');
      } else {
        console.log('✅ Bảng categories đã tồn tại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra/tạo bảng categories:', error.message);
    }
    
    // Kiểm tra và tạo bảng school_supplies nếu chưa tồn tại
    console.log('🔄 Đang kiểm tra bảng school_supplies...');
    try {
      const [tables2] = await connection.query('SHOW TABLES LIKE "school_supplies"');
      if (tables2.length === 0) {
        console.log('❌ Bảng school_supplies chưa tồn tại, đang tạo...');
        await connection.query(`
          CREATE TABLE school_supplies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            unit_price DECIMAL(10,2) NOT NULL,
            stock_quantity INT NOT NULL DEFAULT 0,
            category_id INT,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
          )
        `);
        console.log('✅ Đã tạo bảng school_supplies thành công');
        
        // Thêm dữ liệu mẫu
        await connection.query(`
          INSERT INTO school_supplies (name, description, unit_price, stock_quantity, category_id, image_url) VALUES
          ('Bút bi xanh', 'Bút bi màu xanh Thiên Long', 5000, 100, 1, '/images/products/butbixanh.jpg'),
          ('Vở ô ly', 'Vở ô ly 200 trang', 15000, 50, 1, '/images/products/vooly.jpg'),
          ('Sách Toán lớp 10', 'Sách giáo khoa Toán lớp 10', 25000, 30, 2, '/images/products/sachtoan10.jpg')
        `);
        console.log('✅ Đã thêm dữ liệu mẫu cho bảng school_supplies');
      } else {
        console.log('✅ Bảng school_supplies đã tồn tại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra/tạo bảng school_supplies:', error.message);
    }
    
    // Kiểm tra và tạo bảng orders nếu chưa tồn tại
    console.log('🔄 Đang kiểm tra bảng orders...');
    try {
      const [tables3] = await connection.query('SHOW TABLES LIKE "orders"');
      if (tables3.length === 0) {
        console.log('❌ Bảng orders chưa tồn tại, đang tạo...');
        await connection.query(`
          CREATE TABLE orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            shipping_address TEXT,
            status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
            payment_method VARCHAR(50),
            payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        console.log('✅ Đã tạo bảng orders thành công');
      } else {
        console.log('✅ Bảng orders đã tồn tại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra/tạo bảng orders:', error.message);
    }
    
    // Kiểm tra và tạo bảng order_items nếu chưa tồn tại
    console.log('🔄 Đang kiểm tra bảng order_items...');
    try {
      const [tables4] = await connection.query('SHOW TABLES LIKE "order_items"');
      if (tables4.length === 0) {
        console.log('❌ Bảng order_items chưa tồn tại, đang tạo...');
        await connection.query(`
          CREATE TABLE order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES school_supplies(id) ON DELETE RESTRICT
          )
        `);
        console.log('✅ Đã tạo bảng order_items thành công');
      } else {
        console.log('✅ Bảng order_items đã tồn tại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra/tạo bảng order_items:', error.message);
    }
    
    // Thêm đơn hàng mẫu nếu bảng orders đã tạo nhưng chưa có dữ liệu
    console.log('🔄 Đang kiểm tra dữ liệu đơn hàng...');
    try {
      const [orderCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
      if (orderCount[0].count === 0) {
        console.log('❌ Chưa có dữ liệu đơn hàng, đang thêm đơn hàng mẫu...');
        
        // Lấy user_id của admin để tạo đơn hàng mẫu
        const [adminUser] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
        if (adminUser.length > 0) {
          const adminId = adminUser[0].id;
          
          // Thêm đơn hàng mẫu
          const [orderResult] = await connection.query(`
            INSERT INTO orders (user_id, total_amount, shipping_address, status, payment_method, payment_status)
            VALUES (?, 45000, 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', 'delivered', 'COD', 'paid')
          `, [adminId]);
          
          const orderId = orderResult.insertId;
          
          // Thêm các item trong đơn hàng
          await connection.query(`
            INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
            (?, 1, 3, 5000), 
            (?, 2, 2, 15000)
          `, [orderId, orderId]);
          
          console.log('✅ Đã thêm đơn hàng mẫu thành công');
        } else {
          console.log('⚠️ Không tìm thấy tài khoản admin để tạo đơn hàng mẫu');
        }
      } else {
        console.log('✅ Đã có dữ liệu đơn hàng');
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm dữ liệu đơn hàng mẫu:', error.message);
    }
    
    console.log('===== HOÀN THÀNH KIỂM TRA VÀ TẠO CÁC BẢNG =====');
    await connection.end();
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

fixTables(); 