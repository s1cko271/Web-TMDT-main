import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Thử lấy dữ liệu từ API
        try {
          const response = await axios.get(`/api/orders/user/${user.id}`, {
            headers: {
              'x-auth-token': token
            }
          });
          
          setOrders(response.data);
          setError(null);
        } catch (apiError) {
          console.warn('Error fetching orders from API, falling back to localStorage:', apiError);
          
          // Fallback: Lấy dữ liệu từ localStorage nếu API thất bại
          const localOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
          
          if (localOrders.length > 0) {
            setOrders(localOrders);
            setError(null);
          } else {
            throw new Error('Không thể tải lịch sử đơn hàng từ server và không có dữ liệu cục bộ');
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
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
  
  if (!user) return <div className="auth-message">Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>;
  
  return (
    <div className="order-history-page">
      <div className="container">
        <h1>Lịch sử đơn hàng</h1>
        
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link to="/products" className="shop-now-btn">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">Đơn hàng #{order.id}</div>
                  <div className={`order-status status-${order.status}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>
                
                <div className="order-info">
                  <div className="order-date">
                    <span>Ngày đặt:</span> {formatDate(order.created_at)}
                  </div>
                  <div className="order-total">
                    <span>Tổng tiền:</span> {Number(order.total_amount).toLocaleString('vi-VN')}đ
                  </div>
                </div>
                
                <div className="order-actions">
                  <button 
                    onClick={() => setSelectedOrder(order)} 
                    className="view-modal-btn"
                  >
                    Xem nhanh
                  </button>
                  <Link to={`/orders/${order.id}`} className="view-details-btn">
                    Chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal chi tiết đơn hàng */}
        {selectedOrder && (
          <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="order-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button className="close-modal" onClick={() => setSelectedOrder(null)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="order-detail-header">
                  <div className="order-detail-date">
                    <span>Ngày đặt:</span> {formatDate(selectedOrder.created_at)}
                  </div>
                  <div className={`order-detail-status status-${selectedOrder.status}`}>
                    {getStatusText(selectedOrder.status)}
                  </div>
                </div>
                
                <div className="order-address">
                  <h3>Địa chỉ giao hàng</h3>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>Số điện thoại: {selectedOrder.shipping_phone}</p>
                </div>
                
                <div className="order-items">
                  <h3>Sản phẩm</h3>
                  <div className="item-list">
                    {selectedOrder.items.map((item, index) => (
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
                          {Number(item.total).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Tổng thanh toán:</span>
                    <span>{Number(selectedOrder.total_amount).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>Đóng</button>
                <Link to={`/orders/${selectedOrder.id}`} className="detail-btn">
                  Xem chi tiết đầy đủ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage; 