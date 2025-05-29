import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import { AuthProvider } from './context/AuthContext';
import Debug from './debug';
import './App.css';
import MainLayout from './components/MainLayout';
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Products from './admin/pages/Products';
import Categories from './admin/pages/Categories';
import Orders from './admin/pages/Orders';
import Users from './admin/pages/Users';
import Promotions from './admin/pages/Promotions';
import AdminLogin from './admin/pages/AdminLogin';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <AuthProvider>
      <div className="app">
          <Routes>
          {/* Admin Routes - No Navbar/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
              <Route path="promotions" element={<Promotions />} />
              <Route index element={<Dashboard />} />
            </Route>
          
          {/* Main Website Routes - With Navbar/Footer */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
          <Route path="/category/:categoryName" element={<MainLayout><ProductsPage /></MainLayout>} />
          <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
          <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><CheckoutPage /></MainLayout>} />
          <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
          <Route path="/signup" element={<MainLayout><SignupPage /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
          <Route path="/orders" element={<MainLayout><OrderHistoryPage /></MainLayout>} />
          <Route path="/orders/:orderId" element={<MainLayout><OrderDetailPage /></MainLayout>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;