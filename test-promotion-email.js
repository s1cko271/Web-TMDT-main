require('dotenv').config();
const emailService = require('./utils/email');

async function testPromotionEmail() {
  try {
    const testUsers = [
      {
        id: 1,
        name: 'Người Dùng Test',
        email: 'baophuc2712003@gmail.com' // Email của bạn để nhận thử
      }
    ];
    
    const testPromotion = {
      title: 'Khuyến mãi đặc biệt tháng này',
      description: 'Giảm giá 20% cho tất cả sản phẩm văn phòng phẩm từ ngày 15-30 hàng tháng.',
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 15)),
      code: 'SCHOOL20',
      url: 'http://localhost:5000/promotions'
    };
    
    console.log('Đang gửi email khuyến mãi test...');
    const results = await emailService.sendPromotionEmail(testUsers, testPromotion);
    console.log('Đã gửi email thành công:', results[0].messageId);
  } catch (error) {
    console.error('Lỗi khi gửi email test:', error);
  }
}

testPromotionEmail();