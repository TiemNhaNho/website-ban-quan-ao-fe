# Hướng Dẫn: Bảng Đơn Hàng Mới

## 📋 Thay Đổi Thực Hiện

### 1. **Cấu Trúc Bảng Mới** (orders.html)
Bảng cũ chỉ hiển thị 6 cột đã được cập nhật thành **8 cột chi tiết hơn**:

| Cột | Nội Dung | Ghi Chú |
|-----|----------|--------|
| **Mã Đơn** | Order Code | Hiển thị mã đơn hàng (VD: #ORD001) |
| **Khách Hàng** | Customer Name | Tên khách hàng từ API |
| **Email** | Customer Email | Email khách hàng **MỚI** |
| **Điện Thoại** | Customer Phone | Số điện thoại **MỚI** |
| **Ngày Đặt** | Created Date | Ngày đặt hàng |
| **Tổng Tiền** | Total Amount | Tổng giá trị đơn hàng (định dạng VND) |
| **Trạng Thái** | Status Badge | Badge màu theo trạng thái |
| **Hành Động** | Action Buttons | Xem Chi Tiết / Sửa / Xóa |

---

## 🎨 Cải Tiến Giao Diện

### Bảng:
- ✅ Header gradient (xanh tím)
- ✅ Dòng xen kẽ màu nhẹ (alternating rows)
- ✅ Hover effect mềm mại
- ✅ Sticky header (khi scroll)
- ✅ Responsive design

### Badges (Trạng Thái):
- ✅ Gradient background
- ✅ Shadow effect
- ✅ Hover animation (nổi lên)
- ✅ Các trạng thái:
  - **Chưa xử lí** (pending) - Vàng
  - **Đã xác nhận** (confirmed) - Xanh nhạt
  - **Đang giao** (shipped) - Xanh lơ
  - **Đã giao** (delivered) - Xanh lá
  - **Hủy** (cancelled) - Đỏ

### Nút Hành Động:
- ✅ 3 nút icon: Xem chi tiết, Sửa, Xóa
- ✅ Icon từ icomoon font
- ✅ Hover effect: Scale + Color change

---

## 🔌 Lắp API - Hướng Dẫn

### Cấu Trúc Dữ Liệu Cần Từ API

File: `TiemNhaNho/admin/js/orders.js`

API Endpoint: `GET https://tiem-nha-nho-api.onrender.com/orders`

**Response Format Expected:**
```json
[
  {
    "order_id": 1,
    "order_code": "#ORD001",
    "customer_id": 10,
    "customer_name": "Nguyễn Văn A",
    "customer_email": "nva@email.com",
    "customer_phone": "0123456789",
    "customer_address": "123 Đường ABC, TP HCM",
    "total_amount": 1250000,
    "status": "pending",
    "payment_method": "COD",
    "created_at": "2025-12-31T10:30:00Z"
  }
]
```

### Fields Mapping

| API Field | Hiển Thị Ở Cột | Ghi Chú |
|-----------|----------------|--------|
| `order_code` hoặc `id` | Mã Đơn | Nếu không có `order_code`, code sẽ tự tạo từ `#ORD{id}` |
| `customer_name` hoặc từ customer lookup | Khách Hàng | Nếu không có, sẽ lấy từ bảng customers |
| `customer_email` | Email | **MỚI** - Bắt buộc phải có |
| `customer_phone` | Điện Thoại | **MỚI** - Bắt buộc phải có |
| `created_at` | Ngày Đặt | Format: `dd/mm/yyyy` |
| `total_amount` | Tổng Tiền | Format: `1.250.000 ₫` |
| `status` | Trạng Thái | pending/confirmed/shipped/delivered/cancelled |

### Nếu API Response Khác Format

Code hiện tại hỗ trợ nhiều field name variations:

```javascript
// Hỗ trợ tự động:
- order_id hoặc id
- customer_name hoặc khách_hàng
- customer_email hoặc email
- customer_phone hoặc điện_thoại
- customer_address hoặc địa_chỉ
- total_amount hoặc tổng_tiền hoặc total
- status hoặc trạng_thái
- created_at hoặc ngày_đặt hoặc created_date
```

### Fallback Data

Nếu API fail, code sẽ sử dụng mock data để test:
```javascript
// File: admin/js/orders.js
const mockOrders = [
  {
    order_id: 1,
    order_code: "#ORD001",
    customer_name: "Nguyễn Văn A",
    customer_email: "nva@email.com",
    // ... more fields
  }
]
```

---

## 📝 Chi Tiết Đơn Hàng - Modal View

### Để hiển thị chi tiết đơn hàng

File: `TiemNhaNho/admin/orders.html` (dòng ~130-150)

Modal "Chi Tiết Đơn Hàng" hiện tại hiển thị:
- Mã Đơn
- Khách Hàng
- Email
- Số Điện Thoại
- Địa Chỉ
- Tổng Tiền
- Trạng Thái
- Phương Thức Thanh Toán
- **Danh Sách Sản Phẩm** (items)

### Cần API Chi Tiết Sản Phẩm

Thêm endpoint để lấy items của order:
```
GET /orders/{order_id}/items
hoặc
GET /order-items?order_id={order_id}
```

Response:
```json
[
  {
    "order_item_id": 1,
    "product_id": 5,
    "product_name": "Áo Sơ Mi Nam",
    "variant_id": 12,
    "unit_price": 250000,
    "quantity": 2,
    "subtotal": 500000
  }
]
```

---

## 🔧 Cách Thực Hiện Lắp API

### Bước 1: Kiểm Tra API Response
```bash
# Chạy command này để xem cấu trúc API trả về:
curl https://tiem-nha-nho-api.onrender.com/orders
```

### Bước 2: Update Field Mapping (nếu cần)

File: `TiemNhaNho/admin/js/orders.js` - hàm `loadOrders()` (dòng ~120)

Nếu API fields khác, thêm vào phần mapping:
```javascript
allOrders = allOrders.map(order => {
  return {
    order_id: order.order_id || order.id || Date.now(),
    order_code: order.order_code || order.mã_đơn || `#ORD${order.order_id}`,
    customer_name: order.customer_name || order.tên_khách || 'N/A',
    customer_email: order.customer_email || order.email || '', // ← Thêm dòng này nếu cần
    customer_phone: order.customer_phone || order.phone || '', // ← Thêm dòng này nếu cần
    // ... more fields
  }
})
```

### Bước 3: Test Render Bảng
1. Mở file `admin/orders.html` trong browser
2. Nhấn F12 để mở DevTools
3. Xem console để check lỗi
4. Kiểm tra Network tab để xem API response

---

## 🐛 Debug / Troubleshooting

### Console Logs
File `orders.js` sử dụng console.log để debug:

```javascript
console.log("✅ Orders from API:", allOrders);
console.log("❌ API error:", err);
console.log("⚠️ Using mock data as fallback");
```

### Kiểm Tra Dữ Liệu:
1. Mở DevTools (F12)
2. Xem tab Console
3. Type: `allOrders` để xem dữ liệu hiện tại
4. Type: `allCustomers` để xem khách hàng đã load

### Nếu Bảng Không Hiển Thị:
- ✅ Kiểm tra Network có lỗi API không
- ✅ Kiểm tra token auth nếu API cần
- ✅ Kiểm tra CORS policy
- ✅ Kiểm tra file CSS có load không

---

## 📱 Responsive Design

Bảng đã được thiết kế để responsive:
- **Desktop**: Full width, 8 cột
- **Tablet**: Scroll ngang
- **Mobile**: Scroll ngang horizontal

CSS:
```css
.table-responsive {
  overflow-x: auto;
  border-radius: 8px;
  background: white;
}
```

---

## ✨ Tính Năng Sắp Tới

- [ ] Tìm kiếm/Filter đơn hàng
- [ ] Sort theo cột
- [ ] Export Excel/PDF
- [ ] Bulk action (multi-select)
- [ ] Pagination
- [ ] Real-time status update

---

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra console log
2. Kiểm tra API response format
3. Update field mapping nếu cần
4. Xem mock data fallback
