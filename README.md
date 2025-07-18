# BACKEND BOOKSHOP
## Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd backend-bookshop
```

### 2. Cài đặt các dependencies
```bash
npm install
```

### 3. Tạo file .env
Sao chép file .example.env thành file .env:
```bash
cp .example.env .env
```

### 4. Cấu hình file .env
Mở file .env và cập nhật các thông số sau:
```
# Cấu hình cơ bản
PORT=5000
NODE_ENV=development

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bookshop

# JWT
ACCESS_TOKEN=your_access_token_secret
REFRESH_TOKEN=your_refresh_token_secret

# Email
MAIL_ACCOUNT=your_email@gmail.com
MAIL_PASSWORD=your_email_password

# PayPal
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (cho lưu trữ hình ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# VNPay
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECURE_SECRET=your_vnpay_secure_secret
VNPAY_HOST=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/order/vnpay_return

# Elasticsearch
ELASTIC_CLOUD_ID=your_elastic_cloud_id
ELASTIC_API_KEY=your_elastic_api_key
```

### 5. Cấu hình Elasticsearch (tùy chọn)
Để sử dụng tính năng tìm kiếm nâng cao với Elasticsearch:

1. Đăng ký tài khoản Elastic Cloud:
   - Truy cập [Elastic Cloud](https://cloud.elastic.co/) và đăng ký tài khoản
   - Tạo deployment mới
   - Lấy Cloud ID và API Key từ trang quản lý
   - Điền thông tin vào biến môi trường ELASTIC_CLOUD_ID và ELASTIC_API_KEY trong file .env

2. Hệ thống sẽ tự động tạo các index cần thiết khi khởi động

### 6. Khởi động server
```bash
# Khởi động server với chế độ tự động khởi động lại khi có thay đổi
npm start
```

Server sẽ chạy tại `http://localhost:3001` (hoặc port được cấu hình trong .env)

## Lưu ý
- Đảm bảo MongoDB đang chạy trước khi khởi động server
- Kiểm tra kỹ các thông số trong file .env trước khi triển khai
- Để sử dụng đầy đủ tính năng email, cần cấu hình đúng mật khẩu ứng dụng cho email
