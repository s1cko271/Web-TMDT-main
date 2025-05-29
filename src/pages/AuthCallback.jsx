import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        try {
          // Lưu token vào localStorage
          localStorage.setItem('token', token);

          // Lấy thông tin user từ token
          const response = await fetch('/api/users/me', {
            headers: {
              'x-auth-token': token
            }
          });

          if (response.ok) {
            const userData = await response.json();
            // Cập nhật context với thông tin user
            await login(userData.email, null, token);
            navigate('/');
          } else {
            throw new Error('Failed to get user data');
          }
        } catch (error) {
          console.error('Error during social login callback:', error);
          navigate('/login?error=social_login_failed');
        }
      } else {
        navigate('/login?error=no_token');
      }
    };

    handleCallback();
  }, [location, navigate, login]);

  return (
    <div className="auth-callback">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Completing login...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 