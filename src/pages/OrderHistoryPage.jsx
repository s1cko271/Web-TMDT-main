import React, { useEffect, useState } from 'react';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      const userOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
      setOrders(userOrders.reverse());
    }
  }, [user]);

  if (!user) return <div style={{padding: 40}}>Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>;

  return (
    <div className="order-history-container" style={{maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 32}}>
      <h2 style={{marginBottom: 24}}>Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f5f5'}}>
              <th style={{padding: 10, border: '1px solid #eee'}}>Mã đơn</th>
              <th style={{padding: 10, border: '1px solid #eee'}}>Ngày đặt</th>
              <th style={{padding: 10, border: '1px solid #eee'}}>Tổng tiền</th>
              <th style={{padding: 10, border: '1px solid #eee'}}>Trạng thái</th>
              <th style={{padding: 10, border: '1px solid #eee'}}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{padding: 10, border: '1px solid #eee'}}>{order.id}</td>
                <td style={{padding: 10, border: '1px solid #eee'}}>{order.date}</td>
                <td style={{padding: 10, border: '1px solid #eee'}}>{order.total.toLocaleString()} đ</td>
                <td style={{padding: 10, border: '1px solid #eee'}}>{order.status}</td>
                <td style={{padding: 10, border: '1px solid #eee'}}>
                  <button onClick={() => setSelectedOrder(order)} style={{padding: '6px 14px', borderRadius: 4, border: '1px solid #4a55a2', background: '#fff', color: '#4a55a2', cursor: 'pointer'}}>Xem</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: '#fff', borderRadius: 8, padding: 32, minWidth: 350, maxWidth: 500, boxShadow: '0 2px 12px rgba(0,0,0,0.15)'}}>
            <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
            <p><b>Ngày đặt:</b> {selectedOrder.date}</p>
            <p><b>Trạng thái:</b> {selectedOrder.status}</p>
            <table style={{width: '100%', marginTop: 12, borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{padding: 6, borderBottom: '1px solid #eee'}}>Sản phẩm</th>
                  <th style={{padding: 6, borderBottom: '1px solid #eee'}}>SL</th>
                  <th style={{padding: 6, borderBottom: '1px solid #eee'}}>Giá</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{padding: 6}}>{item.name}</td>
                    <td style={{padding: 6, textAlign: 'center'}}>{item.quantity}</td>
                    <td style={{padding: 6}}>{item.price.toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop: 16, fontWeight: 500}}>Tổng tiền: {selectedOrder.total.toLocaleString()} đ</div>
            <button onClick={() => setSelectedOrder(null)} style={{marginTop: 18, padding: '7px 18px', borderRadius: 4, border: 'none', background: '#4a55a2', color: '#fff', cursor: 'pointer'}}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage; 