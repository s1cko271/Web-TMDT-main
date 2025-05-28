import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Kiểm tra có token không
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
          throw new Error('Không tìm thấy token xác thực');
        }
        
        // Kiểm tra token còn hiệu lực không
        const response = await fetch('/api/admin/verify-token', {
          headers: {
            'x-auth-token': adminToken
          }
        });
        
        if (!response.ok) {
          throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Lỗi xác thực:', error);
        // Xóa token không hợp lệ
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
    };
    
    verifyToken();
    
    // Thiết lập kiểm tra token định kỳ (mỗi 5 phút)
    const interval = setInterval(() => {
      verifyToken();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="admin-layout-loading">
        <div className="loader"></div>
        <p>Đang xác thực...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;