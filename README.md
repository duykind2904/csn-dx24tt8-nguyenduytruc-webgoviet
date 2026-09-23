# GoViet – Khám Phá Việt Nam

Ứng dụng web đơn trang (SPA) giới thiệu các địa danh và điểm đến nổi tiếng tại Việt Nam.  
Xây dựng bằng HTML5, CSS3 và JavaScript thuần — không dùng framework hay backend.

## Tính năng

**Trang người dùng (`index.html`)**
- 🔍 **Tìm kiếm** theo tên địa danh, tỉnh thành hoặc mô tả
- 🗂 **Lọc** theo miền (Bắc / Trung / Nam) và loại hình du lịch
- ↕️ **Sắp xếp** theo tên hoặc đánh giá cao nhất
- 📄 **Phân trang** — 6 địa danh mỗi trang
- 📍 **Chi tiết** từng địa danh với điểm nổi bật và gợi ý địa danh tương tự
- 📱 **Responsive** — hiển thị tốt trên mobile và desktop
- 🗺 **SPA routing** — điều hướng bằng hash URL, không reload trang

**Trang quản trị (`admin.html`)**
- ➕ **Thêm địa danh** mới qua form đầy đủ (tên, tỉnh, miền, loại, mô tả, chi tiết, điểm nổi bật...)
- ⭐ **Chọn đánh giá** bằng giao diện click sao 1–5
- 😊 **Chọn emoji** từ grid 30 biểu tượng
- 🎨 **Chọn màu thẻ** từ 10 gradient preset với preview thực tế
- ✅ **Validation** báo lỗi từng trường, tự scroll đến lỗi đầu tiên
- 🗑️ **Xóa** địa danh đã thêm
- 💾 **Lưu tự động** vào `localStorage` — tồn tại sau khi đóng trình duyệt
- 🔄 **Đồng bộ** với trang chính khi quay lại `index.html`

## Cách chạy

1. Mở VS Code, cài extension **Live Server**
2. Chuột phải vào `scr/index.html` → **Open with Live Server**
3. Truy cập trang quản trị qua link **⚙️ Quản trị** ở cuối trang hoặc mở `scr/admin.html`

## Cấu trúc thư mục

```
├── scr/                  # Mã nguồn ứng dụng
│   ├── index.html        # Trang người dùng (SPA chính)
│   ├── admin.html        # Trang quản trị (thêm/xóa địa danh)
│   ├── css/
│   │   ├── style.css     # CSS chung cho toàn bộ site
│   │   └── admin.css     # CSS riêng cho trang admin
│   └── js/
│       ├── data.js       # Dữ liệu 20 địa danh (JS Array tĩnh)
│       ├── app.js        # Logic SPA: router, render, filter, pagination
│       └── admin.js      # Logic trang admin: form, localStorage, danh sách
├── setup/                # Tập tin cài đặt và dữ liệu thử nghiệm
├── progress-report/      # Báo cáo tiến độ (bắt buộc)
├── thesis/               # Tài liệu Đồ án (bắt buộc)
│   ├── doc/              # Tài liệu dạng .DOC
│   ├── pdf/              # Tài liệu dạng .PDF
│   ├── html/             # Tài liệu dạng web
│   ├── abs/              # Báo cáo Đồ án (.PPT, .AVI, ...)
│   └── refs/             # Tài liệu tham khảo
├── soft/                 # Phần mềm liên quan
└── docker/               # Tập tin triển khai Docker
```

## Công nghệ

| Công nghệ | Vai trò |
|-----------|---------|
| HTML5 | Cấu trúc trang |
| CSS3 | Giao diện, responsive, animation |
| JavaScript (ES6+) | Logic SPA, filter, sort, pagination, DOM |
| JS Array | Lưu trữ dữ liệu tĩnh 20 địa danh |
| localStorage | Lưu địa danh do admin thêm, đồng bộ sang trang chính |

> Không sử dụng: React, Vue, Angular, jQuery, backend, database.

## Thông tin liên lạc

| Họ và tên       | Email                              | Điện thoại  |
|-----------------|------------------------------------|-------------|
| Nguyễn Duy Trúc | trucnd100697@tvu-onschool.edu.vn   | 0362651241  |
