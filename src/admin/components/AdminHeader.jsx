import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminHeader.css';

const AdminHeader = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin admin từ localStorage
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
      setAdminInfo(user);
      } catch (err) {
        console.error('Lỗi khi parse thông tin admin:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    // Xóa token admin và thông tin người dùng
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Chuyển hướng về trang đăng nhập admin
    navigate('/admin/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="admin-header">
      <div className="header-search">
        <i className="fas fa-search"></i>
        <input type="text" placeholder="Tìm kiếm..." />
      </div>
      <div className="header-right">
        <div className="header-notifications">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </div>
        <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {adminInfo && (
            <>
              <div className="user-info" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
              <span className="user-name">{adminInfo.name}</span>
              <div className="user-avatar">
                  <span>{adminInfo.name.charAt(0).toUpperCase()}</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </div>
              <button onClick={handleLogout} className="logout-button" style={{marginLeft: 8, background: '#fff', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: 4, padding: '7px 16px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6}}>
                <i className="fas fa-sign-out-alt"></i>
                Đăng xuất
              </button>
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{adminInfo.name}</strong>
                    <p>{adminInfo.email}</p>
                  </div>
                  <ul className="dropdown-menu">
                    <li>
                      <a href="/admin/profile">
                        <i className="fas fa-user"></i>
                        Hồ sơ
                      </a>
                    </li>
                    <li>
                      <a href="/admin/settings">
                        <i className="fas fa-cog"></i>
                        Cài đặt
                      </a>
                    </li>
                    <li className="divider"></li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;