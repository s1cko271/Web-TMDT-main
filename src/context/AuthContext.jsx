import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Updated login function to support social login
  const login = async (email, password, socialToken = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (socialToken) {
        // Social login - use the provided token
        data = {
          token: socialToken,
          email: email
        };
      } else {
        // Regular login
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          }),
        });

        data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Đăng nhập không thành công');
        }
      }
      
      // Lưu token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Lấy thông tin user
      const userResponse = await fetch('/api/users/me', {
        headers: {
          'x-auth-token': data.token
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user data');
      }

      const userData = await userResponse.json();
      
      // Lưu user vào state
      setUser(userData);
      
      return userData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Gọi API đăng ký từ backend để lưu vào CSDL
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        name,
        email,
          password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký không thành công');
      }
      
      // Lưu user vào state (không bao gồm password)
      setUser(data);
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};