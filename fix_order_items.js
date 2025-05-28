const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixOrderItems() {
  try {
    console.log('===== KIỂM TRA VÀ SỬA LỖI BẢNG ORDER_ITEMS =====');
    
    // Kết nối database
    console.log('🔄 Đang kết nối database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Kết nối database thành công');
    
    // Kiểm tra xem bảng order_items có tồn tại không
    console.log('🔄 Đang kiểm tra bảng order_items...');
    try {
      const [tables] = await connection.query('SHOW TABLES LIKE "order_items"');
      
      if (tables.length === 0) {
        console.log('❌ Bảng order_items không tồn tại, đang tạo mới...');
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
        
        // Kiểm tra cấu trúc của bảng order_items
        console.log('🔄 Đang kiểm tra cấu trúc bảng order_items...');
        const [columns] = await connection.query('SHOW COLUMNS FROM order_items');
        const columnNames = columns.map(col => col.Field);
        
        // Kiểm tra xem cột price có tồn tại không
        if (!columnNames.includes('price')) {
          console.log('❌ Cột price không tồn tại, đang thêm vào...');
          await connection.query('ALTER TABLE order_items ADD COLUMN price DECIMAL(10,2) NOT NULL AFTER quantity');
          console.log('✅ Đã thêm cột price vào bảng order_items');
        } else {
          console.log('✅ Cột price đã tồn tại');
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra/sửa bảng order_items:', error.message);
    }
    
    // Thêm đơn hàng mẫu
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
            VALUES (?, 45000, 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', 'completed', 'COD', 'paid')
          `, [adminId]);
          
          const orderId = orderResult.insertId;
          
          // Kiểm tra xem bảng school_supplies đã có dữ liệu chưa
          const [productCount] = await connection.query('SELECT COUNT(*) as count FROM school_supplies');
          
          // Kiểm tra xem bảng categories đã có dữ liệu chưa
          const [categoryCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
          
          if (categoryCount[0].count === 0) {
            // Thêm danh mục mẫu nếu chưa có
            await connection.query(`
              INSERT INTO categories (name, description, image_url) VALUES
              ('Văn phòng phẩm', 'Các loại dụng cụ văn phòng phẩm', '/images/categories/vanphongpham.jpg'),
              ('Sách giáo khoa', 'Sách giáo khoa các cấp', '/images/categories/sachgiaokhoa.jpg')
            `);
            console.log('✅ Đã thêm danh mục mẫu');
          }
          
          if (productCount[0].count === 0) {
            // Thêm sản phẩm mẫu nếu chưa có
            await connection.query(`
              INSERT INTO school_supplies (name, description, unit_price, stock_quantity, category_id, image_url) VALUES
              ('Bút bi xanh', 'Bút bi màu xanh Thiên Long', 5000, 100, 1, '/images/products/butbixanh.jpg'),
              ('Vở ô ly', 'Vở ô ly 200 trang', 15000, 50, 1, '/images/products/vooly.jpg')
            `);
            console.log('✅ Đã thêm sản phẩm mẫu');
          }
          
          // Lấy ID của các sản phẩm mẫu
          const [products] = await connection.query('SELECT id FROM school_supplies LIMIT 2');
          if (products.length >= 2) {
            // Thêm các item trong đơn hàng
            await connection.query(`
              INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
              (?, ?, 3, 5000), 
              (?, ?, 2, 15000)
            `, [orderId, products[0].id, orderId, products[1].id]);
            
            console.log('✅ Đã thêm đơn hàng mẫu thành công');
          } else {
            console.log('⚠️ Không đủ sản phẩm để tạo đơn hàng mẫu');
          }
        } else {
          console.log('⚠️ Không tìm thấy tài khoản admin để tạo đơn hàng mẫu');
        }
      } else {
        console.log('✅ Đã có dữ liệu đơn hàng');
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm dữ liệu đơn hàng mẫu:', error.message);
    }
    
    console.log('===== HOÀN THÀNH SỬA LỖI BẢNG ORDER_ITEMS =====');
    await connection.end();
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

fixOrderItems(); 