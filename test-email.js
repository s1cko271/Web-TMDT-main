require('dotenv').config();
const emailService = require('./utils/email');

async function testRegistrationEmail() {
  try {
    const testUser = {
      name: 'Người Dùng Test',
      email: 'baophuc2712003@gmail.com' // Email của bạn để nhận thử
    };
    
    console.log('Đang gửi email đăng ký test...');
    const result = await emailService.sendRegistrationEmail(testUser);
    console.log('Đã gửi email thành công:', result.messageId);
  } catch (error) {
    console.error('Lỗi khi gửi email test:', error);
  }
}

testRegistrationEmail();