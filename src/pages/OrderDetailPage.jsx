import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, user, navigate]);

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Hàm chuyển đổi trạng thái thanh toán sang tiếng Việt
  const getPaymentStatusText = (status) => {
    const statusMap = {
      'pending': 'Chưa thanh toán',
      'paid': 'Đã thanh toán',
      'failed': 'Thanh toán thất bại'
    };
    return statusMap[status] || status;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render tracking status steps
  const renderOrderTracking = (status) => {
    const steps = [
      { key: 'pending', label: 'Đơn hàng đã đặt' },
      { key: 'processing', label: 'Đang xử lý' },
      { key: 'completed', label: 'Hoàn thành' }
    ];
    
    // Tìm chỉ số của trạng thái hiện tại
    const currentIndex = steps.findIndex(step => step.key === status);
    
    // Xử lý trường hợp đơn hàng bị hủy
    if (status === 'cancelled') {
      return (
        <div className="order-tracking cancelled">
          <div className="tracking-step active">
            <div className="step-icon">✓</div>
            <div className="step-label">Đơn hàng đã đặt</div>
          </div>
          <div className="tracking-line"></div>
          <div className="tracking-step cancelled">
            <div className="step-icon">✕</div>
            <div className="step-label">Đơn hàng đã hủy</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="order-tracking">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className={`tracking-step ${index <= currentIndex ? 'active' : ''}`}>
              <div className="step-icon">{index <= currentIndex ? '✓' : index}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`tracking-line ${index < currentIndex ? 'active' : ''}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) return <div className="loading-container">Đang tải thông tin đơn hàng...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!order) return <div className="error-container">Không tìm thấy đơn hàng</div>;

  return (
    <div className="order-detail-page">
      <div className="container">
        <div className="order-navigation">
          <Link to="/orders" className="back-link">
            <i className="fas fa-arrow-left"></i> Quay lại lịch sử đơn hàng
          </Link>
        </div>

        <div className="order-header">
          <h1>Chi tiết đơn hàng #{order.id}</h1>
          <div className={`order-status status-${order.status}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Tracking section */}
        <div className="tracking-section">
          <h2>Theo dõi đơn hàng</h2>
          {renderOrderTracking(order.status)}
        </div>

        <div className="order-details-grid">
          <div className="order-info-section">
            <div className="info-card">
              <h3>Thông tin đơn hàng</h3>
              <div className="info-row">
                <span>Mã đơn hàng:</span>
                <span>#{order.id}</span>
              </div>
              <div className="info-row">
                <span>Ngày đặt:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="info-row">
                <span>Phương thức thanh toán:</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="info-row">
                <span>Trạng thái thanh toán:</span>
                <span className={`payment-status ${order.payment_status}`}>
                  {getPaymentStatusText(order.payment_status)}
                </span>
              </div>
            </div>
            
            <div className="info-card">
              <h3>Thông tin giao hàng</h3>
              <div className="info-row">
                <span>Người nhận:</span>
                <span>{order.user?.name || 'Không có thông tin'}</span>
              </div>
              <div className="info-row">
                <span>Địa chỉ:</span>
                <span>{order.shipping_address}</span>
              </div>
              <div className="info-row">
                <span>Số điện thoại:</span>
                <span>{order.shipping_phone}</span>
              </div>
            </div>
          </div>

          <div className="order-items-section">
            <h3>Sản phẩm đã đặt</h3>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img src={item.image_url || '/product-placeholder.jpg'} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">
                      {Number(item.unit_price).toLocaleString('vi-VN')}đ x {item.quantity}
                    </div>
                  </div>
                  <div className="item-total">
                    {Number(item.quantity * item.unit_price).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Tổng tiền sản phẩm:</span>
                <span>{Number(order.total_amount).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>0đ</span>
              </div>
              <div className="summary-row total">
                <span>Tổng thanh toán:</span>
                <span>{Number(order.total_amount).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="order-footer">
          <Link to="/products" className="continue-shopping">
            Tiếp tục mua sắm
          </Link>
          {order.status === 'pending' && (
            <button className="cancel-order-btn">
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 