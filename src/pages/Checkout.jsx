import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    };
    fetchUser();

    // Fetch cart data
    const fetchCart = async () => {
      const response = await fetch('/api/carts');
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
        setSelectedItems(cartData.map(item => item.id));
        setTotal(cartData.reduce((total, item) => total + item.price * item.cartQuantity, 0));
      }
    };
    fetchCart();
  }, []);

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Lưu thông tin đơn hàng vào CSDL
      const orderData = {
        user_id: user.id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.cartQuantity
        })),
        shipping_address: user.address || '',
        shipping_phone: user.phone || '',
        payment_method: 'VNPay',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
      const updatedCart = cart.filter(item => !selectedItems.includes(item.id));
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Cập nhật lại số lượng sản phẩm trong CSDL
      for (const item of cart.filter(item => selectedItems.includes(item.id))) {
        await fetch(`/api/products/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quantity: item.quantity - item.cartQuantity
          })
        });
      }

      // Chuyển hướng đến trang xác nhận đơn hàng
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại sau.');
    }
  };

  return (
    <div>
      {/* Render your checkout form here */}
    </div>
  );
};

export default Checkout; 