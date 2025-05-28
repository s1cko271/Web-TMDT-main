import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra xem đã đăng nhập chưa
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Nếu đã có token, chuyển hướng đến dashboard
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setDebugInfo(null);

    try {
      // Gọi API đăng nhập admin
      console.log('Đang gọi API đăng nhập admin...');
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      // Lưu debug info
      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        data
      });

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      console.log('Đăng nhập thành công, lưu token và thông tin user...');
      // Lưu token vào localStorage
      localStorage.setItem('adminToken', data.token);
      
      // Đảm bảo user có trường name và is_admin
      const userToStore = {
        id: data.user.id,
        name: data.user.name || 'Admin',
        email: data.user.email,
        isAdmin: true
      };
      
      localStorage.setItem('adminUser', JSON.stringify(userToStore));
      console.log('Lưu thông tin thành công, chuyển hướng đến dashboard...');

      // Chuyển hướng đến trang admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        <div className="admin-login-header">
          <h1>School Store</h1>
          <h2>Đăng nhập quản trị</h2>
        </div>
        
        {error && <div className="admin-login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
            />
          </div>
          
          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        {debugInfo && (
          <div className="debug-info">
            <h3>Thông tin debug</h3>
            <p>Status: {debugInfo.status} {debugInfo.statusText}</p>
            <pre>{JSON.stringify(debugInfo.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin; 