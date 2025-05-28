import React, { useState, useEffect } from 'react';
import '../styles/Promotions.css';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percent: '',
    start_date: '',
    end_date: '',
    code: '',
    is_active: true
  });
  const [users, setUsers] = useState([]);
  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    content: '',
    recipients: [],
    includeAll: false
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  // Fetch promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Không tìm thấy token xác thực');
        }

        const response = await fetch('/api/admin/promotions', {
          headers: {
            'x-auth-token': token
          }
        });

        if (!response.ok) {
          throw new Error('Không thể tải danh sách khuyến mãi');
        }

        const data = await response.json();
        setPromotions(data);
      } catch (err) {
        setError(err.message);
        console.error('Lỗi khi tải khuyến mãi:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Fetch users khi mở form email
  useEffect(() => {
    if (showEmailForm) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('adminToken');
          if (!token) {
            throw new Error('Không tìm thấy token xác thực');
          }

          const response = await fetch('/api/admin/users', {
            headers: {
              'x-auth-token': token
            }
          });

          if (!response.ok) {
            throw new Error('Không thể tải danh sách người dùng');
          }

          const data = await response.json();
          setUsers(data.filter(user => !user.is_admin));
        } catch (err) {
          setError(err.message);
          console.error('Lỗi khi tải danh sách người dùng:', err);
        }
      };

      fetchUsers();
    }
  }, [showEmailForm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle email form input changes
  const handleEmailInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'includeAll') {
      setEmailFormData({
        ...emailFormData,
        includeAll: checked,
        recipients: checked ? [] : emailFormData.recipients
      });
    } else {
      setEmailFormData({
        ...emailFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle user selection
  const handleUserSelection = (userId, email) => {
    const isSelected = emailFormData.recipients.includes(email);
    
    if (isSelected) {
      setEmailFormData({
        ...emailFormData,
        recipients: emailFormData.recipients.filter(r => r !== email)
      });
    } else {
      setEmailFormData({
        ...emailFormData,
        recipients: [...emailFormData.recipients, email]
      });
    }
  };

  // Open form to add new promotion
  const handleAddNew = () => {
    setCurrentPromotion(null);
    setFormData({
      title: '',
      description: '',
      discount_percent: '',
      start_date: '',
      end_date: '',
      code: '',
      is_active: true
    });
    setShowForm(true);
  };

  // Open email form
  const handleOpenEmailForm = () => {
    setEmailFormData({
      subject: '',
      content: '',
      recipients: [],
      includeAll: false
    });
    setEmailSuccess('');
    setShowEmailForm(true);
  };

  // Open form to edit promotion
  const handleEdit = (promotion) => {
    setCurrentPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description || '',
      discount_percent: promotion.discount_percent,
      start_date: new Date(promotion.start_date).toISOString().split('T')[0],
      end_date: new Date(promotion.end_date).toISOString().split('T')[0],
      code: promotion.code,
      is_active: promotion.is_active
    });
    setShowForm(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const url = currentPromotion
        ? `/api/admin/promotions/${currentPromotion.id}`
        : '/api/admin/promotions';

      const method = currentPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      const data = await response.json();

      if (currentPromotion) {
        setPromotions(promotions.map(promo => promo.id === currentPromotion.id ? data : promo));
      } else {
        setPromotions([...promotions, data]);
      }

      setShowForm(false);
    } catch (err) {
      setError(err.message);
      console.error('Lỗi khi lưu khuyến mãi:', err);
    }
  };

  // Handle send custom email form submission
  const handleSendCustomEmail = async (e) => {
    e.preventDefault();
    setIsSendingEmail(true);
    setEmailSuccess('');
    setError('');
    
    try {
      // Debug data being sent
      console.log('Email form data:', emailFormData);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      if (!emailFormData.subject || !emailFormData.content) {
        throw new Error('Tiêu đề và nội dung email là bắt buộc');
      }

      if (!emailFormData.includeAll && emailFormData.recipients.length === 0) {
        throw new Error('Bạn chưa chọn người nhận nào');
      }

      const response = await fetch('/api/admin/send-custom-promotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(emailFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi gửi email');
      }

      const data = await response.json();
      setEmailSuccess(data.message);
      
    } catch (err) {
      setError(err.message);
      console.error('Lỗi khi gửi email khuyến mãi:', err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Delete promotion
  const handleDelete = async (promotionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch(`/api/admin/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      setPromotions(promotions.filter(promo => promo.id !== promotionId));
    } catch (err) {
      setError(err.message);
      console.error('Lỗi khi xóa khuyến mãi:', err);
    }
  };

  // Send promotion emails
  const handleSendEmails = async (promotionId) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch(`/api/admin/promotions/${promotionId}/send-emails`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      alert('Đã gửi email khuyến mãi thành công!');
    } catch (err) {
      setError(err.message);
      console.error('Lỗi khi gửi email khuyến mãi:', err);
    }
  };

  if (isLoading) {
    return <div className="promotions-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="promotions-page">
      <h1>Quản lý khuyến mãi</h1>

      {error && <div className="promotions-error">{error}</div>}
      {emailSuccess && <div className="promotions-success">{emailSuccess}</div>}

      <div className="promotions-actions">
        <button className="add-button" onClick={handleAddNew}>
          <i className="fas fa-plus"></i> Thêm khuyến mãi
        </button>
        <button className="email-all-button" onClick={handleOpenEmailForm}>
          <i className="fas fa-envelope"></i> Gửi email quảng cáo
        </button>
      </div>

      {showEmailForm && (
        <div className="promotion-form-container">
          <div className="promotion-form email-form">
            <h2>Gửi email quảng cáo</h2>
            <form onSubmit={handleSendCustomEmail}>
              <div className="form-group">
                <label htmlFor="subject">Tiêu đề email</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={emailFormData.subject}
                  onChange={handleEmailInputChange}
                  required
                  placeholder="Ví dụ: Khuyến mãi giảm giá 50% cho tất cả sản phẩm"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Nội dung email (HTML)</label>
                <textarea
                  id="content"
                  name="content"
                  value={emailFormData.content}
                  onChange={handleEmailInputChange}
                  rows="10"
                  required
                  placeholder="<h1>Khuyến mãi lớn!</h1><p>Chúng tôi giảm giá 50% cho tất cả sản phẩm từ ngày 1/1 đến 31/1.</p>"
                ></textarea>
                <small>Bạn có thể sử dụng các thẻ HTML như &lt;h1&gt;, &lt;p&gt;, &lt;a&gt;, &lt;img&gt;,...</small>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="includeAll"
                  name="includeAll"
                  checked={emailFormData.includeAll}
                  onChange={handleEmailInputChange}
                />
                <label htmlFor="includeAll">Gửi cho tất cả người dùng</label>
              </div>

              {!emailFormData.includeAll && (
                <div className="form-group">
                  <label>Chọn người nhận</label>
                  <div className="user-selection-container">
                    {users.length > 0 ? (
                      <div className="user-selection-list">
                        {users.map(user => (
                          <div key={user.id} className="user-selection-item">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              checked={emailFormData.recipients.includes(user.email)}
                              onChange={() => handleUserSelection(user.id, user.email)}
                            />
                            <label htmlFor={`user-${user.id}`}>
                              {user.name} ({user.email})
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-users">Đang tải danh sách người dùng...</p>
                    )}
                    <div className="selection-summary">
                      {emailFormData.includeAll ? (
                        <p>Gửi đến tất cả người dùng</p>
                      ) : (
                        <p>Đã chọn {emailFormData.recipients.length} người nhận</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? 'Đang gửi...' : 'Gửi email'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEmailForm(false)}
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="promotion-form-container">
          <div className="promotion-form">
            <h2>{currentPromotion ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="discount_percent">Phần trăm giảm giá (%)</label>
                <input
                  type="number"
                  id="discount_percent"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="code">Mã khuyến mãi</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date">Ngày bắt đầu</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">Ngày kết thúc</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_active">Kích hoạt</label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="save-button">
                  {currentPromotion ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {promotions.length === 0 ? (
        <div className="no-promotions">
          <i className="fas fa-bullhorn"></i>
          <p>Chưa có khuyến mãi nào</p>
        </div>
      ) : (
        <div className="promotions-list">
          <table className="promotions-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Mã</th>
                <th>Giảm giá</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promotion => (
                <tr key={promotion.id}>
                  <td>{promotion.title}</td>
                  <td><span className="promotion-code">{promotion.code}</span></td>
                  <td>{promotion.discount_percent}%</td>
                  <td>
                    {new Date(promotion.start_date).toLocaleDateString('vi-VN')} - {new Date(promotion.end_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <span className={`status-badge ${promotion.is_active ? 'active' : 'inactive'}`}>
                      {promotion.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(promotion)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(promotion.id)}
                      title="Xóa"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                    <button
                      className="email-button"
                      onClick={() => handleSendEmails(promotion.id)}
                      title="Gửi email"
                    >
                      <i className="fas fa-envelope"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Promotions;