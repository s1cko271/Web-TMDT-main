const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixOrderStatus() {
  try {
    console.log('===== KIỂM TRA VÀ SỬA LỖI CỘT STATUS TRONG BẢNG ORDERS =====');
    
    // Kết nối database
    console.log('🔄 Đang kết nối database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Kết nối database thành công');
    
    // Kiểm tra cấu trúc cột status trong bảng orders
    console.log('🔄 Đang kiểm tra cấu trúc cột status trong bảng orders...');
    try {
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM orders WHERE Field = 'status'
      `);
      
      if (columns.length > 0) {
        console.log('📊 Cấu trúc hiện tại của cột status:', columns[0].Type);
        
        // Sửa lại cột status để chấp nhận nhiều giá trị hơn
        console.log('🔄 Đang sửa cấu trúc cột status...');
        await connection.query(`
          ALTER TABLE orders 
          MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed', 'on-hold') DEFAULT 'pending'
        `);
        console.log('✅ Đã sửa cấu trúc cột status thành công');
      } else {
        console.log('❌ Không tìm thấy cột status trong bảng orders');
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra/sửa cột status:', error.message);
    }
    
    // Thêm đơn hàng mẫu nếu bảng orders chưa có dữ liệu
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
    
    console.log('===== HOÀN THÀNH SỬA LỖI CỘT STATUS =====');
    await connection.end();
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

fixOrderStatus(); 