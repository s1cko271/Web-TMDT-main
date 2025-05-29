# School Store - E-commerce Văn Phòng Phẩm

## Tổng quan
School Store là hệ thống web thương mại điện tử chuyên về văn phòng phẩm, phục vụ học sinh, sinh viên, giáo viên và doanh nghiệp. Dự án gồm frontend React hiện đại, backend Node.js/Express, cơ sở dữ liệu MySQL, hỗ trợ đa ngôn ngữ, bảo mật JWT, đăng nhập Google/Facebook, quản trị mạnh mẽ và nhiều tính năng thực tế.

---

## Kiến trúc & Công nghệ sử dụng

### Backend
- **Node.js & Express**: Xây dựng RESTful API.
- **MySQL**: Lưu trữ dữ liệu sản phẩm, đơn hàng, người dùng, v.v.
- **JWT**: Xác thực bảo mật.
- **Passport.js**: Đăng nhập Google, Facebook.
- **Nodemailer**: Gửi email xác nhận đơn hàng, đăng ký.
- **dotenv**: Quản lý biến môi trường.
- **bcryptjs**: Mã hóa mật khẩu.
- **CORS**: Hỗ trợ frontend-backend.
- **mysql2**: Kết nối MySQL.

### Frontend
- **ReactJS**: Xây dựng giao diện động, hiện đại.
- **React Router**: Điều hướng SPA.
- **React Context**: Quản lý trạng thái đăng nhập, giỏ hàng.
- **i18next**: Đa ngôn ngữ (Việt/Anh).
- **Axios**: Giao tiếp API.
- **Vite**: Bundler siêu nhanh.
- **Quill**: Rich text editor cho mô tả sản phẩm.

### DevOps & Khác
- **Vercel**: Triển khai production.
- **Concurrently, Nodemon**: Dev tool.
- **QR Code**: Tích hợp mã QR cho đơn hàng.

---

## Chức năng chính

### Người dùng
- Đăng ký, đăng nhập (email, Google, Facebook)
- Xem sản phẩm, tìm kiếm, lọc, phân loại
- Thêm vào giỏ hàng, đặt hàng, thanh toán
- Theo dõi đơn hàng, lịch sử mua
- Đánh giá sản phẩm, đổi mật khẩu
- Chatbot hỗ trợ (nếu có)

### Quản trị (Admin)
- Đăng nhập bảo mật
- Quản lý sản phẩm, danh mục, đơn hàng, người dùng
- Quản lý khuyến mãi, mã giảm giá
- Thống kê doanh thu, số lượng đơn, sản phẩm bán chạy
- Xét duyệt, cập nhật trạng thái đơn hàng
- Tự động kiểm thử API admin

---

## Cấu trúc thư mục
- `/src` - Frontend React
  - `pages/` - Trang chính (Home, Login, Product, Cart, Checkout, Profile...)
  - `admin/` - Trang quản trị (Dashboard, Products, Orders, Users...)
  - `components/` - Thành phần giao diện dùng chung
  - `context/` - Quản lý trạng thái
- `/routes` - API backend (users, products, orders, admin...)
- `/config` - Cấu hình DB, Passport, email
- `/database` - Script khởi tạo, seed dữ liệu
- `/public` - Ảnh, icon, file tĩnh

---

## Lý thuyết & Mô hình
- **Kiến trúc 3 lớp**: Presentation (React), Business Logic (Express), Data (MySQL)
- **RESTful API**: Chuẩn hóa endpoint, phân quyền rõ ràng
- **Authentication**: JWT, OAuth2 (Google, Facebook)
- **Authorization**: Phân quyền user/admin
- **Bảo mật**: Hash password, CSRF, CORS, kiểm tra token hết hạn
- **Khả năng mở rộng**: Tách biệt frontend-backend, dễ deploy cloud
- **Khả năng bảo trì**: Code clean, tách module, có test tự động

---

## Hướng dẫn chạy dự án
1. Clone repo, cài Node.js, MySQL
2. Tạo file `.env` theo mẫu
3. Chạy script khởi tạo DB nếu cần
4. `npm install` (backend), `cd frontend && npm install` (frontend nếu tách riêng)
5. `npm run dev` (hoặc `concurrently`)
6. Truy cập `http://localhost:5173`

---

## Tài liệu API
Xem file `API_DOCUMENTATION.md` để biết chi tiết endpoint, request/response mẫu.

---

## Đóng góp & phát triển
- Fork, tạo branch, pull request
- Đóng góp thêm tính năng, sửa lỗi, tối ưu UI/UX

---

**© 2024 School Store - Văn phòng phẩm hiện đại cho mọi người!** 
