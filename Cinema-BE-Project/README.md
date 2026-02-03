# 🎬 Cinema Management System - Backend API

Hệ thống quản lý rạp chiếu phim được xây dựng bằng **Node.js** theo mô hình **MVC**.

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Documentation](#api-documentation)
- [Team Members](#team-members)

## 🎯 Giới thiệu

Dự án quản lý toàn bộ quy trình hoạt động của rạp chiếu phim từ đặt vé online, quản lý suất chiếu, bán hàng tại quầy đến báo cáo doanh thu.

## ✨ Tính năng

### 👤 Khách hàng (Guest & User)
- Xem trang chủ, tìm kiếm & lọc phim
- Đăng ký, đăng nhập, quên mật khẩu (OTP)
- Xem lịch chiếu, chọn ghế, đặt vé online
- Thanh toán qua VNPay/Momo
- Tích điểm & đổi quà
- Đánh giá phim

### 🎫 Nhân viên (Staff)
- Bán vé tại quầy (POS)
- Soát vé, in vé
- Báo cáo sự cố
- Quản lý ca làm việc

### 🎬 Quản lý (Manager)
- Quản lý phim, suất chiếu
- Quản lý phòng chiếu & sơ đồ ghế
- Quản lý giá vé & sản phẩm F&B
- Kiểm duyệt đánh giá
- Xem báo cáo thống kê

### 👨‍💼 Admin (System Admin)
- Quản lý người dùng & nhân viên
- Quản lý chi nhánh rạp
- Quản lý voucher
- Dashboard & báo cáo doanh thu
- Cấu hình hệ thống

## 🛠 Công nghệ sử dụng

- **Backend Framework:** Express.js
- **Database:** MySQL với Sequelize ORM
- **Authentication:** JWT (JSON Web Token)
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **Payment:** VNPay, Momo
- **PDF Generation:** PDFKit
- **Excel Export:** ExcelJS
- **QR Code:** qrcode
- **Validation:** express-validator
- **Security:** Helmet, Rate Limiting
- **Logging:** Winston, Morgan

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 16.x
- MySQL >= 8.0
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd Cinema-Project
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
```bash
cp .env.example .env
# Sau đó chỉnh sửa file .env với thông tin của bạn
```

4. **Tạo database**
```bash
# Tạo database trong MySQL
CREATE DATABASE cinema_db;
```

5. **Chạy migrations (nếu có)**
```bash
npm run migrate
```

6. **Chạy seeders (dữ liệu mẫu - nếu có)**
```bash
npm run seed
```

7. **Khởi động server**
```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📁 Cấu trúc thư mục

```
Cinema-Project/
├── src/
│   ├── config/          # Cấu hình database, JWT, email, payment
│   ├── models/          # Database models (Sequelize)
│   ├── controllers/     # Controllers theo role (auth, customer, staff, manager, admin)
│   ├── routes/          # API routes
│   ├── middlewares/     # Middleware (auth, validation, upload...)
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── validations/     # Validation schemas
│   ├── constants/       # Constants & enums
│   └── app.js          # Express app initialization
├── tests/              # Unit & Integration tests
├── logs/               # Log files
├── uploads/            # Uploaded files
├── docs/               # API documentation
├── .env                # Environment variables
├── .gitignore
├── package.json
├── server.js           # Entry point
└── README.md
```

## 📚 API Documentation

API endpoints được tổ chức theo module:

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Customer
- `GET /api/movies` - Danh sách phim
- `GET /api/movies/:id` - Chi tiết phim
- `POST /api/bookings` - Đặt vé
- `GET /api/bookings/history` - Lịch sử đặt vé

### Staff
- `POST /api/staff/pos/ticket` - Bán vé tại quầy
- `POST /api/staff/checkin` - Soát vé

### Manager
- `POST /api/manager/movies` - Thêm phim mới
- `POST /api/manager/showtimes` - Tạo suất chiếu

### Admin
- `GET /api/admin/dashboard` - Dashboard
- `GET /api/admin/reports/revenue` - Báo cáo doanh thu

Chi tiết đầy đủ: Xem file `docs/swagger.yaml` hoặc Postman Collection

## 👥 Team Members

| STT | Thành viên | Vai trò | Module phụ trách |
|-----|-----------|---------|------------------|
| 1 | PHONG | Guest & Customer | Tài khoản & Tìm kiếm |
| 2 | TOÀN | Customer | Quy trình đặt vé |
| 3 | TRUNG | Staff | Nhân viên tại quầy |
| 4 | ĐẠT | Manager | Quản lý nội dung & Lịch chiếu |
| 5 | CHÂU | Admin | Quản trị hệ thống & Báo cáo |

## 📝 License

ISC

## 📧 Contact

Mọi thắc mắc vui lòng liên hệ: [your-email@example.com]
