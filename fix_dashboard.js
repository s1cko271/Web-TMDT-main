const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDashboard() {
  try {
    console.log('===== KIỂM TRA VÀ KHẮC PHỤC LỖI API DASHBOARD =====');
    
    // Kết nối database
    console.log('🔄 Đang kết nối database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Kết nối database thành công');
    
    // Kiểm tra các truy vấn được sử dụng trong API dashboard
    console.log('🔄 Đang kiểm tra truy vấn lấy tổng số người dùng...');
    try {
      const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log('✅ Truy vấn lấy tổng số người dùng thành công:', userCount[0].count);
    } catch (error) {
      console.error('❌ Lỗi khi truy vấn người dùng:', error.message);
    }
    
    console.log('🔄 Đang kiểm tra truy vấn lấy tổng số sản phẩm...');
    try {
      const [productCount] = await connection.query('SELECT COUNT(*) as count FROM school_supplies');
      console.log('✅ Truy vấn lấy tổng số sản phẩm thành công:', productCount[0].count);
    } catch (error) {
      console.error('❌ Lỗi khi truy vấn sản phẩm:', error.message);
    }
    
    console.log('🔄 Đang kiểm tra truy vấn lấy tổng số đơn hàng...');
    try {
      const [orderCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
      console.log('✅ Truy vấn lấy tổng số đơn hàng thành công:', orderCount[0].count);
    } catch (error) {
      console.error('❌ Lỗi khi truy vấn đơn hàng:', error.message);
    }
    
    console.log('🔄 Đang kiểm tra truy vấn lấy tổng doanh thu...');
    try {
      const [revenue] = await connection.query('SELECT SUM(total_amount) as total FROM orders');
      console.log('✅ Truy vấn lấy tổng doanh thu thành công:', revenue[0].total || 0);
    } catch (error) {
      console.error('❌ Lỗi khi truy vấn doanh thu:', error.message);
    }
    
    console.log('🔄 Đang kiểm tra truy vấn lấy 5 sản phẩm bán chạy nhất...');
    try {
      const [topProducts] = await connection.query(`
        SELECT p.id, p.name, p.unit_price, SUM(oi.quantity) as total_sold
        FROM school_supplies p
        JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
      `);
      console.log('✅ Truy vấn lấy 5 sản phẩm bán chạy nhất thành công:', topProducts.length);
    } catch (error) {
      console.error('❌ Lỗi khi truy vấn sản phẩm bán chạy:', error.message);
    }
    
    console.log('🔄 Đang kiểm tra truy vấn lấy 5 đơn hàng gần nhất...');
    try {
      const [recentOrders] = await connection.query(`
        SELECT o.id, o.user_id, u.name as user_name, o.total_amount, o.status, o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);
      console.log('✅ Truy vấn lấy 5 đơn hàng gần nhất thành công:', recentOrders.length);
    } catch (error) {
      console.error('❌ Lỗi khi truy vấn đơn hàng gần nhất:', error.message);
    }
    
    // Khắc phục nếu có lỗi trong bảng order_items hoặc price
    console.log('🔄 Đang kiểm tra dữ liệu trong order_items...');
    try {
      const [orderItemsCount] = await connection.query('SELECT COUNT(*) as count FROM order_items');
      if (orderItemsCount[0].count === 0) {
        console.log('⚠️ Bảng order_items không có dữ liệu, thêm dữ liệu mẫu...');
        
        // Lấy ID của đơn hàng đầu tiên
        const [orders] = await connection.query('SELECT id FROM orders LIMIT 1');
        if (orders.length > 0) {
          const orderId = orders[0].id;
          
          // Lấy ID của sản phẩm
          const [products] = await connection.query('SELECT id FROM school_supplies LIMIT 2');
          if (products.length >= 2) {
            // Thêm các item vào đơn hàng
            await connection.query(`
              INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
              (?, ?, 3, 5000), 
              (?, ?, 2, 15000)
            `, [orderId, products[0].id, orderId, products[1].id]);
            
            console.log('✅ Đã thêm dữ liệu mẫu vào order_items thành công');
          }
        }
      } else {
        console.log('✅ Bảng order_items đã có dữ liệu:', orderItemsCount[0].count);
        
        // Kiểm tra cột price
        try {
          const [priceCheck] = await connection.query('SELECT price FROM order_items LIMIT 1');
          console.log('✅ Cột price hoạt động bình thường');
        } catch (error) {
          console.error('❌ Lỗi khi truy vấn cột price:', error.message);
          console.log('🔄 Đang cập nhật giá trị cho cột price...');
          
          // Cập nhật giá trị cho cột price dựa trên unit_price của sản phẩm
          await connection.query(`
            UPDATE order_items oi
            JOIN school_supplies p ON oi.product_id = p.id
            SET oi.price = p.unit_price
            WHERE oi.price IS NULL OR oi.price = 0
          `);
          console.log('✅ Đã cập nhật giá trị cho cột price');
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra bảng order_items:', error.message);
    }
    
    console.log('===== HOÀN THÀNH KIỂM TRA VÀ KHẮC PHỤC LỖI API DASHBOARD =====');
    await connection.end();
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

fixDashboard(); 