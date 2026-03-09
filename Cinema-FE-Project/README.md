# 🎬 Cinema Management System - Frontend

Giao diện người dùng cho hệ thống quản lý rạp chiếu phim được xây dựng bằng **React.js**.

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Team Members](#team-members)

## 🎯 Giới thiệu

Frontend application cho phép người dùng đặt vé xem phim online, quản lý thông tin cá nhân, và cung cấp giao diện quản trị cho nhân viên, manager và admin.

## ✨ Tính năng

### 🌐 Public Pages (Guest)
- Trang chủ với phim nổi bật & banner
- Tìm kiếm & lọc phim nâng cao
- Xem chi tiết phim, trailer, lịch chiếu
- Liên hệ & góp ý

### 👤 Customer Portal
- Đăng ký, đăng nhập, quên mật khẩu
- Đặt vé online (chọn suất chiếu, chọn ghế, đặt combo)
- Thanh toán qua VNPay/Momo
- Lịch sử đặt vé & QR code
- Tích điểm & đổi quà
- Đánh giá & bình luận phim

### 🎫 Staff Dashboard
- POS bán vé tại quầy
- Soát vé & check-in
- Quản lý ca làm việc
- Báo cáo sự cố

### 🎬 Manager Dashboard
- Quản lý phim & suất chiếu
- Quản lý phòng chiếu & sơ đồ ghế
- Quản lý giá vé & F&B
- Kiểm duyệt đánh giá
- Báo cáo thống kê

### 👨‍💼 Admin Dashboard
- Quản lý người dùng & nhân viên
- Quản lý chi nhánh rạp
- Quản lý voucher
- Dashboard & báo cáo doanh thu
- Cấu hình hệ thống

## 🛠 Công nghệ sử dụng

- **Framework:** React 18
- **Routing:** React Router v6
- **State Management:** Redux Toolkit + React Context
- **Data Fetching:** React Query (TanStack Query)
- **Form Handling:** React Hook Form
- **HTTP Client:** Axios
- **Styling:** CSS Modules (hoặc Tailwind/MUI)
- **Charts:** Chart.js + React-Chartjs-2
- **QR Code:** qrcode.react
- **Notifications:** React Toastify
- **Icons:** React Icons
- **Date/Time:** Moment.js

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 16.x
- npm hoặc yarn

### Các bước cài đặt

1. **Di chuyển vào thư mục frontend**
```bash
cd cinema-frontend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
```bash
copy .env.example .env
# Chỉnh sửa file .env với API URL của backend
```

4. **Khởi động development server**
```bash
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:4200`

5. **Build production**
```bash
npm run build
```

## 📁 Cấu trúc thư mục

```
cinema-frontend/
├── public/                   # Static files
├── src/
│   ├── api/                 # API calls & Axios config
│   ├── assets/              # Images, icons, videos
│   ├── components/          # Reusable components
│   │   ├── common/          # Common UI components
│   │   ├── layout/          # Layout components
│   │   ├── movie/           # Movie-related components
│   │   ├── booking/         # Booking-related components
│   │   └── payment/         # Payment components
│   ├── pages/               # Page components
│   │   ├── guest/           # Public pages
│   │   ├── auth/            # Auth pages
│   │   ├── customer/        # Customer pages
│   │   ├── staff/           # Staff pages
│   │   ├── manager/         # Manager pages
│   │   └── admin/           # Admin pages
│   ├── routes/              # Routing configuration
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context
│   ├── redux/               # Redux store & slices
│   ├── services/            # Business logic
│   ├── utils/               # Helper functions
│   └── styles/              # Global styles
├── .env                     # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🎨 UI/UX Design

### Color Palette (Đề xuất)
- Primary: `#E50914` (Netflix Red)
- Secondary: `#221F1F` (Dark Gray)
- Background: `#141414` (Almost Black)
- Text: `#FFFFFF` (White)
- Accent: `#FFD700` (Gold for VIP)

### Typography
- Headings: `Poppins, sans-serif`
- Body: `Inter, sans-serif`

## 🔐 Authentication Flow

1. User đăng nhập → JWT token được lưu trong localStorage
2. Axios interceptor tự động gửi token trong header
3. Protected routes kiểm tra token & role
4. Token hết hạn → Auto refresh hoặc redirect login

## 📱 Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Build production
```bash
npm run build
```

### Deploy to Vercel/Netlify
- Connect Git repository
- Set environment variables
- Auto deploy on push

## 👥 Team Members

| STT | Thành viên | Module phụ trách |
|-----|-----------|------------------|
| 1 | PHONG | Guest & Auth Pages |
| 2 | TOÀN | Customer Booking Flow |
| 3 | TRUNG | Staff Dashboard |
| 4 | ĐẠT | Manager Dashboard |
| 5 | CHÂU | Admin Dashboard |

## 📝 License

ISC

## 📧 Contact

Mọi thắc mắc vui lòng liên hệ: [your-email@example.com]
