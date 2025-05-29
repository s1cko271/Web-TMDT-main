import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(email, password);
    if (result) {
      navigate('/');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{t('loginPage.title', 'Login to Your Account')}</h2>
        <p className="auth-subtitle">{t('loginPage.subtitle', 'Welcome back! Please enter your details.')}</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('profilePage.email', 'Email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('loginPage.emailPlaceholder', 'Enter your email')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('loginPage.password', 'Password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('loginPage.passwordPlaceholder', 'Enter your password')}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? t('loginPage.loggingIn', 'Logging in...') : t('navbar.login', 'Login')}
          </button>
        </form>

        <div className="social-login">
          <p className="social-divider">
            <span>{t('loginPage.orLoginWith', 'Or login with')}</span>
          </p>
          
          <button 
            onClick={handleGoogleLogin}
            className="social-button google-button"
            type="button"
          >
            <img src="/google-icon.png" alt="Google" />
            {t('loginPage.loginWithGoogle', 'Login with Google')}
          </button>
          
          <button 
            onClick={handleFacebookLogin}
            className="social-button facebook-button"
            type="button"
          >
            <img src="/facebook-icon.png" alt="Facebook" />
            {t('loginPage.loginWithFacebook', 'Login with Facebook')}
          </button>
        </div>
        
        <p className="auth-redirect">
          {t('loginPage.noAccount', 'Don\'t have an account?')} <Link to="/signup">{t('navbar.signup', 'Sign up')}</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;