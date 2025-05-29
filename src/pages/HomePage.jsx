import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Banner from '../components/Banner';
import PromotionBanner from '../components/PromotionBanner';
import DiscountBanner from '../components/DiscountBanner';
import './HomePage.css';



const HomePage = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  
  // Fetch featured products from API
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
        setCategoriesError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoriesError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products?featured=true');
        // Limit to 4 featured products
        const featured = response.data.slice(0, 4).map(product => ({
          id: product.id,
          name: product.name,
          price: product.unit_price,
          rating: 4.5, // Default rating since it might not be in the database
          image: product.image_url || `/${product.image}`,
          stock: product.stock_quantity,
          status: product.status
        }));
        setFeaturedProducts(featured);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        // Fallback to sample data if API fails
        setFeaturedProducts([
          { id: 1, name: 'Wireless Headphones', price: 129.99, rating: 4.5, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
          { id: 2, name: 'Smart Watch', price: 199.99, rating: 4.2, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1099&q=80' },
          { id: 3, name: 'Premium Backpack', price: 79.99, rating: 4.7, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
          { id: 4, name: 'Fitness Tracker', price: 49.99, rating: 4.0, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);
  
  return (
    <div className="home-page">
      {/* Hero Section - moved to top */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Shop the Latest School Supplies</h1>
            <p className="hero-description">
              Khám phá bộ sưu tập văn phòng phẩm chất lượng, giá tốt cho học sinh, sinh viên và giáo viên.<br/>
              Từ bút, vở, dụng cụ học tập đến đồ dùng văn phòng – mọi thứ bạn cần đều có tại School Store!
            </p>
            <Link to="/products" className="btn btn-primary">{t('homePage.shopNow', 'Shop Now')}</Link>
          </div>
        </div>
      </section>

      {/* Banner Slider Section - moved below hero */}
      <section className="banner-section">
        <div className="container">
          <Banner />
        </div>
      </section>

      {/* Promotion Banner Section */}
      <section className="promotion-section">
        <div className="container">
          <PromotionBanner />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <h2 className="section-title">{t('homePage.shopByCategory', 'Shop by Category')}</h2>
          {categoriesLoading ? (
            <div className="loading-message">
              <p>Loading categories...</p>
            </div>
          ) : categoriesError ? (
            <div className="error-message">
              <p>{categoriesError}</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Discount Banner Section */}
      <DiscountBanner />
      
      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <h2 className="section-title">{t('homePage.featuredProducts', 'Featured Products')}</h2>
          {loading ? (
            <div className="loading-message">
              <p>Loading featured products...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>{t('homePage.subscribeNewsletter', 'Subscribe to Our Newsletter')}</h2>
            <p>{t('homePage.newsletterDesc', 'Get the latest updates on new products and upcoming sales')}</p>
            <form className="newsletter-form">
              <input type="email" placeholder={t('homePage.emailPlaceholder', 'Your email address')} required />
              <button type="submit" className="btn btn-primary">{t('homePage.subscribe', 'Subscribe')}</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;