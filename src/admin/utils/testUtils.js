/**
 * Utility functions cho việc tự động kiểm thử chức năng admin
 */

// Kiểm tra API đăng nhập admin
export const testAdminLogin = async (email, password) => {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error('Test admin login failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Kiểm tra API Dashboard
export const testDashboardData = async (token) => {
  try {
    const response = await fetch('/api/admin/dashboard', {
      headers: {
        'x-auth-token': token,
      },
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error('Test dashboard data failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Kiểm tra API danh sách sản phẩm
export const testProductsList = async (token) => {
  try {
    const response = await fetch('/api/admin/products', {
      headers: {
        'x-auth-token': token,
      },
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error('Test products list failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Kiểm tra API danh sách danh mục
export const testCategoriesList = async (token) => {
  try {
    const response = await fetch('/api/admin/categories', {
      headers: {
        'x-auth-token': token,
      },
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error('Test categories list failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Kiểm tra API danh sách đơn hàng
export const testOrdersList = async (token) => {
  try {
    const response = await fetch('/api/admin/orders', {
      headers: {
        'x-auth-token': token,
      },
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error('Test orders list failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Kiểm tra API danh sách người dùng
export const testUsersList = async (token) => {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'x-auth-token': token,
      },
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error('Test users list failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Kiểm tra API danh sách khuyến mãi
export const testPromotionsList = async (token) => {
  try {
    const response = await fetch('/api/admin/promotions', {
      headers: {
        'x-auth-token': token,
      },
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      statusCode: response.status,
      data,
    };
  } catch (error) {
    console.error('Test promotions list failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Chạy tất cả các test
export const runAllAdminTests = async (email, password) => {
  const results = {
    login: null,
    dashboard: null,
    products: null,
    categories: null,
    orders: null,
    users: null,
    promotions: null,
  };

  console.log('Bắt đầu kiểm thử hệ thống Admin...');
  
  // Test đăng nhập
  console.log('Đang kiểm thử đăng nhập admin...');
  results.login = await testAdminLogin(email, password);
  
  if (!results.login.success) {
    console.error('Đăng nhập thất bại, dừng kiểm thử.');
    return results;
  }
  
  const token = results.login.data.token;
  
  // Test các chức năng khác
  console.log('Đang kiểm thử dashboard...');
  results.dashboard = await testDashboardData(token);
  
  console.log('Đang kiểm thử danh sách sản phẩm...');
  results.products = await testProductsList(token);
  
  console.log('Đang kiểm thử danh sách danh mục...');
  results.categories = await testCategoriesList(token);
  
  console.log('Đang kiểm thử danh sách đơn hàng...');
  results.orders = await testOrdersList(token);
  
  console.log('Đang kiểm thử danh sách người dùng...');
  results.users = await testUsersList(token);
  
  console.log('Đang kiểm thử danh sách khuyến mãi...');
  results.promotions = await testPromotionsList(token);
  
  console.log('Hoàn thành kiểm thử!');
  return results;
};

// Format kết quả kiểm thử để hiển thị
export const formatTestResults = (results) => {
  const summary = {
    passed: 0,
    failed: 0,
    total: Object.keys(results).length,
  };
  
  const details = Object.entries(results).map(([name, result]) => {
    const passed = result && result.success;
    
    if (passed) {
      summary.passed += 1;
    } else {
      summary.failed += 1;
    }
    
    return {
      name,
      passed,
      statusCode: result ? result.statusCode : null,
      error: result && !result.success ? result.error : null,
      dataCount: result && result.data && Array.isArray(result.data) ? result.data.length : null,
    };
  });
  
  return { summary, details };
}; 