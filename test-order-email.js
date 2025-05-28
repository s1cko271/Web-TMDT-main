require('dotenv').config();
const emailService = require('./utils/email');

async function testOrderConfirmationEmail() {
  try {
    const testUser = {
      name: 'Người Dùng Test',
      email: 'baophuc2712003@gmail.com', // Email của bạn để nhận thử
      address: '123 Đường Test, Quận 1, TP.HCM',
      phone: '0123456789'
    };
    
    const testOrder = {
      id: 12345,
      created_at: new Date(),
      status: 'pending'
    };
    
    const testItems = [
      { name: 'Sản phẩm Test 1', quantity: 2, price: 150000 },
      { name: 'Sản phẩm Test 2', quantity: 1, price: 200000 }
    ];
    
    console.log('Đang gửi email xác nhận đơn hàng test...');
    const result = await emailService.sendOrderConfirmationEmail(testUser, testOrder, testItems);
    console.log('Đã gửi email thành công:', result.messageId);
  } catch (error) {
    console.error('Lỗi khi gửi email test:', error);
  }
}

testOrderConfirmationEmail();