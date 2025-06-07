# Hướng dẫn Cấu hình Elasticsearch

## Biến môi trường

Thêm các biến môi trường sau vào file `.env` của backend:

```
# Cấu hình Elasticsearch Cloud
ELASTIC_CLOUD_ID=your_elastic_cloud_id
ELASTIC_API_KEY=your_elastic_api_key
```

## Đăng ký Elastic Cloud

1. Truy cập [Elastic Cloud](https://cloud.elastic.co/) và đăng ký tài khoản
2. Tạo deployment mới (có phiên bản miễn phí)
3. Lấy Cloud ID và API Key từ trang quản lý
4. Điền thông tin vào biến môi trường

## API Tìm kiếm

### 1. Tìm kiếm Sản phẩm
```
GET /api/product/search?q=từ_khóa&page=1&limit=10&sort=relevance
```

Các tham số:
- `q`: Từ khóa tìm kiếm (bắt buộc)
- `page`: Trang kết quả (mặc định: 1)
- `limit`: Số kết quả mỗi trang (mặc định: 10)
- `sort`: Cách sắp xếp, có thể là:
  - `relevance`: Theo độ liên quan (mặc định)
  - `name_asc`: Tên sách A-Z
  - `name_desc`: Tên sách Z-A
  - `price_asc`: Giá tăng dần
  - `price_desc`: Giá giảm dần
  - `publicationYear_asc`: Năm xuất bản cũ nhất
  - `publicationYear_desc`: Năm xuất bản mới nhất
  - `rating_asc`: Đánh giá thấp đến cao
  - `rating_desc`: Đánh giá cao đến thấp

### 2. Đồng bộ Elasticsearch
```
POST /api/product/sync-elasticsearch
```
(Yêu cầu quyền admin)

## Hoạt động tự động

- Hook tự động được thêm vào ProductModel để đồng bộ dữ liệu khi tạo/xóa sản phẩm
- Đồng bộ thủ công bằng API cần thiết khi khởi tạo ban đầu hoặc có lỗi đồng bộ

## Khắc phục sự cố

- Nếu API tìm kiếm không hoạt động, kiểm tra:
  1. Biến môi trường đã được cấu hình đúng
  2. Kết nối với Elastic Cloud thành công (kiểm tra log khi khởi động server)
  3. Đã đồng bộ dữ liệu bằng API `sync-elasticsearch` 