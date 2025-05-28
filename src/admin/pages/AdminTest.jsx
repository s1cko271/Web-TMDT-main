import React, { useState } from 'react';
import { runAllAdminTests, formatTestResults } from '../utils/testUtils';
import '../styles/AdminTest.css';

const AdminTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState('');

  const handleRunTests = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu admin');
      return;
    }
    
    setIsRunning(true);
    setError('');
    setTestResults(null);
    
    try {
      const results = await runAllAdminTests(email, password);
      const formattedResults = formatTestResults(results);
      setTestResults(formattedResults);
    } catch (err) {
      setError('Lỗi khi chạy kiểm thử: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };
  
  const getStatusClass = (passed) => {
    return passed ? 'test-passed' : 'test-failed';
  };
  
  const getStatusIcon = (passed) => {
    return passed ? '✓' : '✗';
  };

  return (
    <div className="admin-test-page">
      <h1>Kiểm thử tự động trang Admin</h1>
      <p className="test-description">
        Công cụ này giúp kiểm tra các chức năng API và giao diện của trang admin.
        Nhập thông tin đăng nhập admin để bắt đầu chạy các bài kiểm thử.
      </p>

      <div className="test-form-container">
        <form onSubmit={handleRunTests} className="test-form">
          <div className="form-group">
            <label htmlFor="email">Email Admin</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email admin"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="run-test-button"
            disabled={isRunning}
          >
            {isRunning ? 'Đang chạy kiểm thử...' : 'Chạy kiểm thử'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="test-error">
          <p>{error}</p>
        </div>
      )}
      
      {testResults && (
        <div className="test-results-container">
          <div className="test-summary">
            <h2>Kết quả kiểm thử</h2>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Tổng số bài kiểm thử:</span>
                <span className="summary-value">{testResults.summary.total}</span>
              </div>
              <div className="summary-item passed">
                <span className="summary-label">Đã vượt qua:</span>
                <span className="summary-value">{testResults.summary.passed}</span>
              </div>
              <div className="summary-item failed">
                <span className="summary-label">Thất bại:</span>
                <span className="summary-value">{testResults.summary.failed}</span>
              </div>
            </div>
          </div>
          
          <div className="test-details">
            <h3>Chi tiết kiểm thử</h3>
            <table className="test-details-table">
              <thead>
                <tr>
                  <th>Chức năng</th>
                  <th>Trạng thái</th>
                  <th>Mã HTTP</th>
                  <th>Số lượng dữ liệu</th>
                  <th>Thông báo lỗi</th>
                </tr>
              </thead>
              <tbody>
                {testResults.details.map((test) => (
                  <tr key={test.name} className={getStatusClass(test.passed)}>
                    <td className="test-name">
                      <strong>{test.name}</strong>
                    </td>
                    <td className="test-status">
                      <span className={`status-badge ${test.passed ? 'pass' : 'fail'}`}>
                        {getStatusIcon(test.passed)} {test.passed ? 'Thành công' : 'Thất bại'}
                      </span>
                    </td>
                    <td className="test-status-code">{test.statusCode || 'N/A'}</td>
                    <td className="test-data-count">{test.dataCount !== null ? test.dataCount : 'N/A'}</td>
                    <td className="test-error">{test.error || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTest; 