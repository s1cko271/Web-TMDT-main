import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
// import QRCode from 'qrcode.react';
import './QRCodePayment.css';

// Component giả lập QR Code để không phụ thuộc vào thư viện bên ngoài
const QRCodeFallback = ({ value, size = 180 }) => {
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        background: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        border: '1px solid #ddd',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📱</div>
      <div style={{ fontSize: '12px', textAlign: 'center', padding: '0 10px' }}>
        Mã QR mẫu <br />
        (Chỉ để minh họa)
      </div>
    </div>
  );
};

const QRCodePaymentNew = ({ paymentMethod, amount, onPaymentComplete }) => {
  const { t } = useTranslation();
  const [qrData, setQrData] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState('pending'); // pending, processing, completed, failed
  const [countdown, setCountdown] = useState(300); // 5 phút đếm ngược
  const [timeLeft, setTimeLeft] = useState('');
  
  // Xác định thông tin dựa trên phương thức thanh toán
  const getPaymentInfo = () => {
    switch(paymentMethod) {
      case 'momo':
        return {
          title: 'MoMo',
          color: '#ae2070',
          instructions: t('checkoutPage.qrInstructions.momo', 'Quét mã QR bằng ứng dụng MoMo để thanh toán')
        };
      case 'zalopay':
        return {
          title: 'ZaloPay',
          color: '#0068ff',
          instructions: t('checkoutPage.qrInstructions.zalopay', 'Quét mã QR bằng ứng dụng ZaloPay để thanh toán')
        };
      case 'vnpay':
        return {
          title: 'VNPAY',
          color: '#e50019',
          instructions: t('checkoutPage.qrInstructions.vnpay', 'Quét mã QR bằng ứng dụng VNPAY để thanh toán')
        };
      default:
        return null;
    }
  };
  
  useEffect(() => {
    // Tạo QR Code và thông tin giao dịch
    const initializeTransaction = async () => {
      try {
        // Trong ứng dụng thực tế, bạn sẽ gọi API của cổng thanh toán để tạo giao dịch
        const transactionData = {
          amount: amount,
          paymentMethod: paymentMethod,
          description: `Thanh toán đơn hàng qua ${paymentMethod === 'momo' ? 'MoMo' : 'ZaloPay'}`
        };
        
        // Giả lập việc gọi API cổng thanh toán
        // const response = await axios.post('/api/payments/create-transaction', transactionData);
        
        // Thay vì gọi API thực, chúng ta tạo dữ liệu mẫu
        const mockTransactionId = 'TX' + Date.now();
        setTransactionId(mockTransactionId);
        
        // Tạo dữ liệu QR code - Trong thực tế, cổng thanh toán sẽ cung cấp dữ liệu này
        const qrContent = `${paymentMethod}://pay?amount=${amount}&transactionId=${mockTransactionId}&appId=YOURAPPID`;
        setQrData(qrContent);
        setStatus('processing');
        
        // Báo cho component cha biết về ID giao dịch
        // onPaymentInitialized(mockTransactionId);
      } catch (error) {
        console.error('Lỗi khi tạo giao dịch:', error);
        setStatus('failed');
      }
    };
    
    initializeTransaction();
  }, [paymentMethod, amount]);
  
  // Theo dõi trạng thái thanh toán
  useEffect(() => {
    if (!transactionId || status !== 'processing') return;
    
    const checkPaymentStatus = async () => {
      try {
        // Trong ứng dụng thực tế, gọi API để kiểm tra trạng thái
        // const response = await axios.get(`/api/payments/status/${transactionId}`);
        
        // Giả lập việc kiểm tra trạng thái thanh toán
        // Trong ứng dụng thực, dùng API cổng thanh toán để kiểm tra
        
        // Chỉ để demo, chúng ta sẽ xác nhận thanh toán khi người dùng nhấp vào nút "Xác nhận đã thanh toán"
      } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
      }
    };
    
    // Kiểm tra trạng thái mỗi 5 giây
    const intervalId = setInterval(checkPaymentStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, [transactionId, status]);
  
  // Xử lý đếm ngược thời gian
  useEffect(() => {
    if (status !== 'processing') return;
    
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          setStatus('failed');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [status]);
  
  // Format thời gian đếm ngược
  useEffect(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
  }, [countdown]);
  
  // Xử lý khi người dùng xác nhận đã thanh toán (chỉ cho mục đích demo)
  const handleConfirmPayment = async () => {
    try {
      // Trong ứng dụng thực tế, bạn sẽ không cần nút này
      // vì trạng thái sẽ được cập nhật tự động bởi webhook từ cổng thanh toán
      
      // Giả lập cập nhật trạng thái đơn hàng
      const mockOrderId = 'ORD' + Date.now();
      
      // Cập nhật trạng thái thanh toán trong ứng dụng
      setStatus('completed');
      
      // Gọi API để cập nhật trạng thái đơn hàng trong cơ sở dữ liệu
      // await axios.put(`/api/payments/${transactionId}/confirm`);
      
      // Thông báo cho component cha
      if (onPaymentComplete) {
        onPaymentComplete(mockOrderId);
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận thanh toán:', error);
      setStatus('failed');
    }
  };
  
  // Xử lý khi người dùng hủy giao dịch
  const handleCancelPayment = () => {
    setStatus('failed');
  };
  
  const paymentInfo = getPaymentInfo();
  
  if (!paymentInfo) return null;
  
  return (
    <div className="qr-payment-container">
      <h3 className="qr-payment-title" style={{ color: paymentInfo.color }}>
        {t('checkoutPage.payWith', 'Thanh toán với')} {paymentInfo.title}
      </h3>
      
      {status === 'pending' && (
        <div className="qr-payment-loading">
          <div className="spinner"></div>
          <p>Đang tạo mã QR...</p>
        </div>
      )}
      
      {status === 'processing' && (
        <div className="qr-payment-content">
          <div className="qr-code-wrapper">
            <QRCodeFallback value={qrData} size={180} />
          </div>
          
          <div className="qr-payment-instructions">
            <div className="qr-payment-amount">
              <span>Số tiền:</span> <strong>{amount.toLocaleString('vi-VN')}đ</strong>
            </div>
            
            <div className="qr-payment-timer">
              <span>Mã QR hết hạn sau:</span> <strong>{timeLeft}</strong>
            </div>
            
            <ol className="qr-payment-steps">
              <li>Mở ứng dụng {paymentInfo.title} trên điện thoại</li>
              <li>Chọn "Quét mã QR"</li>
              <li>Quét mã QR hiển thị bên cạnh</li>
              <li>Xác nhận thanh toán trên ứng dụng</li>
            </ol>
            
            <div className="qr-payment-buttons">
              <button className="qr-payment-confirm-btn" onClick={handleConfirmPayment}>
                Xác nhận đã thanh toán
              </button>
              <button className="qr-payment-cancel-btn" onClick={handleCancelPayment}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      
      {status === 'completed' && (
        <div className="qr-payment-success">
          <div className="success-icon">✓</div>
          <h3>Thanh toán thành công!</h3>
          <p>Mã giao dịch: {transactionId}</p>
          <p className="payment-info">Đơn hàng của bạn đang được xử lý.</p>
        </div>
      )}
      
      {status === 'failed' && (
        <div className="qr-payment-failed">
          <div className="failed-icon">✕</div>
          <h3>Thanh toán thất bại</h3>
          <p>Đã xảy ra lỗi trong quá trình thanh toán hoặc phiên giao dịch đã hết hạn.</p>
          <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
        </div>
      )}
    </div>
  );
};

export default QRCodePaymentNew;