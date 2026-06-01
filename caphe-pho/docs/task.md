# TASK BREAKDOWN – COFIREVIEW WEB APP

## Sprint 1 – Hiển thị dữ liệu & Định danh người dùng

### US1 – Danh sách quán nổi bật (2 SP)

#### Backend

* Tạo API lấy danh sách quán.
* Tạo query lấy dữ liệu từ database.
* Xử lý trường hợp không có dữ liệu.

#### Frontend

* Tạo giao diện Grid Card.
* Hiển thị ảnh, tên, địa chỉ, rating.
* Hiển thị trạng thái loading.
* Hiển thị thông báo "Chưa có dữ liệu".

---

### US2 – Chi tiết quán và review (2 SP)

#### Backend

* Tạo API lấy chi tiết quán theo ID.
* Tạo API lấy danh sách review theo quán.
* Xử lý lỗi ID không tồn tại.

#### Frontend

* Tạo trang chi tiết quán.
* Hiển thị thông tin quán.
* Hiển thị danh sách review.
* Tạo nút quay lại.
* Tạo trang 404.

---

### US3 – Đăng ký và đăng nhập (5 SP)

#### Database

* Tạo bảng users.

#### Backend

* API Register.
* API Login.
* Hash mật khẩu.
* Validate email.
* Validate password.
* Kiểm tra email trùng.
* Sinh JWT hoặc Session.
* Middleware Authentication.

#### Frontend

* Form Register.
* Form Login.
* Hiển thị lỗi validation.
* Lưu token.
* Hiển thị trạng thái đăng nhập.
* Hiển thị tên người dùng.

---

### US7 – Lọc theo danh mục (2 SP)

#### Backend

* API lấy danh mục.
* API lọc quán theo category.

#### Frontend

* Tạo dropdown hoặc button filter.
* Gọi API khi đổi danh mục.
* Re-render danh sách.
* Xử lý trạng thái không có kết quả.

---

## Sprint 2 – Review và Cá nhân hóa

### US4 – Viết đánh giá (3 SP)

#### Database

* Tạo bảng reviews.

#### Backend

* API tạo review.
* Kiểm tra đăng nhập.
* Validate rating.
* Validate nội dung.
* Cập nhật điểm trung bình quán.

#### Frontend

* Form đánh giá.
* Component chọn số sao.
* Hiển thị thông báo thành công/thất bại.
* Refresh danh sách review sau khi tạo.

---

### US5 – Sửa/Xóa review (3 SP)

#### Backend

* API cập nhật review.
* API xóa review.
* Authorization kiểm tra chủ sở hữu.
* Cập nhật lại điểm trung bình.

#### Frontend

* Hiển thị nút Sửa.
* Hiển thị nút Xóa.
* Modal xác nhận xóa.
* Form chỉnh sửa review.
* Cập nhật UI sau thao tác.

---

### US6 – Danh sách yêu thích (3 SP)

#### Database

* Tạo bảng favorites.

#### Backend

* API thêm yêu thích.
* API bỏ yêu thích.
* API lấy danh sách yêu thích.
* Kiểm tra đăng nhập.

#### Frontend

* Hiển thị icon trái tim.
* Toggle trạng thái yêu thích.
* Trang danh sách yêu thích.
* Popup yêu cầu đăng nhập.

---

## Definition of Done (DoD)

Một task được xem là hoàn thành khi:

* Code hoàn tất.
* Build thành công.
* Không có lỗi nghiêm trọng.
* Được review bởi ít nhất 1 thành viên.
* Chạy đúng Happy Path.
* Merge vào nhánh chính.
* Sẵn sàng demo.
