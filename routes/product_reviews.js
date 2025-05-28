const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Tạo bảng product_reviews nếu chưa tồn tại
async function setupReviewsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES school_supplies(id) ON DELETE CASCADE,
        UNIQUE KEY user_product (user_id, product_id)
      )
    `);

    console.log('Product reviews table setup completed');
  } catch (error) {
    console.error('Error setting up product reviews table:', error.message);
  }
}

// Gọi hàm setup khi khởi động server
setupReviewsTable();

// POST tạo đánh giá mới hoặc cập nhật đánh giá hiện có
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate
    if (!product_id || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Kiểm tra sản phẩm tồn tại
    const [product] = await pool.query('SELECT * FROM school_supplies WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Kiểm tra đánh giá đã tồn tại
    const [existingReview] = await pool.query(
      'SELECT * FROM product_reviews WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (existingReview.length > 0) {
      // Cập nhật đánh giá hiện có
      await pool.query(
        'UPDATE product_reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE user_id = ? AND product_id = ?',
        [rating, comment || '', user_id, product_id]
      );

      // Lấy đánh giá đã cập nhật
      const [updated] = await pool.query(
        'SELECT * FROM product_reviews WHERE user_id = ? AND product_id = ?',
        [user_id, product_id]
      );

      return res.json(updated[0]);
    } else {
      // Tạo đánh giá mới
      const [result] = await pool.query(
        'INSERT INTO product_reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
        [user_id, product_id, rating, comment || '']
      );

      const reviewId = result.insertId;

      // Lấy đánh giá đã tạo
      const [created] = await pool.query('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);

      return res.status(201).json(created[0]);
    }
  } catch (error) {
    console.error('Error creating/updating review:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET lấy tất cả đánh giá của một sản phẩm
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy tất cả đánh giá của sản phẩm kèm theo thông tin người dùng
    const [reviews] = await pool.query(`
      SELECT r.*, u.name as user_name
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [productId]);

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching product reviews:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET lấy tất cả đánh giá của một người dùng
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra quyền (chỉ admin hoặc chính người dùng đó mới có thể xem)
    if (req.user.id !== parseInt(userId) && !req.user.is_admin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Lấy tất cả đánh giá của người dùng kèm theo thông tin sản phẩm
    const [reviews] = await pool.query(`
      SELECT r.*, p.name as product_name, p.image_url
      FROM product_reviews r
      JOIN school_supplies p ON r.product_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE xóa một đánh giá
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Lấy thông tin đánh giá
    const [review] = await pool.query('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);
    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Kiểm tra quyền (chỉ admin hoặc chính người dùng đó mới có thể xóa)
    if (req.user.id !== review[0].user_id && !req.user.is_admin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Xóa đánh giá
    await pool.query('DELETE FROM product_reviews WHERE id = ?', [reviewId]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 