# PRODUCT BACKLOG – COFIREVIEW WEB APP

## Product Goal

Xây dựng nền tảng đánh giá minh bạch, cho phép người dùng tra cứu thông tin quán, lưu trữ sở thích cá nhân, đăng nhập bảo mật để trực tiếp đóng góp và quản lý đánh giá.

---

| ID  | User Story                                                                                                                                             | Story Point | Acceptance Criteria                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1 | **As a Visitor**, I want xem danh sách các quán nổi bật, so that tôi có thể dễ dàng lựa chọn điểm đến.                                                 | 2           | - Hiển thị danh sách quán dạng Grid Card.<br>- Mỗi card gồm ảnh, tên quán, địa chỉ và rating.<br>- Hiển thị thông báo "Chưa có dữ liệu" khi danh sách rỗng.                                                                              |
| US2 | **As a Visitor**, I want xem chi tiết thông tin và đọc các đánh giá cũ của quán, so that tôi biết được chất lượng thực tế của quán.                    | 2           | - Xem thông tin chi tiết quán.<br>- Hiển thị danh sách review gồm tên người dùng, số sao và nội dung.<br>- Có nút quay lại danh sách.<br>- Hiển thị trang 404 nếu ID quán không tồn tại.                                                 |
| US3 | **As a Visitor**, I want đăng ký và đăng nhập tài khoản, so that hệ thống ghi nhận định danh bảo mật của tôi.                                          | 5           | - Email đúng định dạng.<br>- Mật khẩu tối thiểu 8 ký tự gồm chữ và số.<br>- Thông báo khi email đã tồn tại.<br>- Hiển thị trạng thái đã đăng nhập kèm tên người dùng.                                                                    |
| US4 | **As an Authenticated User**, I want viết đánh giá cho quán, so that tôi có thể chia sẻ trải nghiệm thực tế với cộng đồng.                             | 3           | - Chỉ người dùng đăng nhập mới thấy form đánh giá.<br>- Chọn số sao từ 1–5.<br>- Nội dung tối đa 500 ký tự.<br>- Hệ thống tự động liên kết review với người dùng hiện tại.<br>- Điểm trung bình quán được cập nhật sau khi gửi đánh giá. |
| US5 | **As an Authenticated User**, I want chỉnh sửa hoặc xóa review của chính mình, so that tôi có thể cập nhật lại quan điểm nếu quán thay đổi chất lượng. | 3           | - Chỉ hiển thị nút Sửa/Xóa với review của chính người dùng.<br>- Không cho phép chỉnh sửa review của người khác.<br>- Điểm trung bình quán được cập nhật sau khi sửa hoặc xóa.                                                           |
| US6 | **As an Authenticated User**, I want lưu quán cà phê vào danh sách yêu thích, so that tôi có thể dễ dàng tìm lại và ghé thăm sau này.                  | 3           | - Hiển thị nút Yêu thích trên mỗi quán.<br>- Khi lưu thành công icon đổi trạng thái.<br>- Dữ liệu được lưu vào hệ thống.<br>- Người chưa đăng nhập được yêu cầu đăng nhập.                                                               |
| US7 | **As a Visitor**, I want lọc danh sách quán theo danh mục (Cà phê, Trà sữa, Bánh ngọt), so that tôi nhanh chóng tìm đúng loại đồ uống đang cần.        | 2           | - Hiển thị bộ lọc danh mục trên giao diện.<br>- Danh sách cập nhật theo danh mục được chọn.<br>- Hỗ trợ luồng sử dụng chính (Happy Path).                                                                                                |

---

## Tổng Story Point

| Sprint   | Story              |
| -------- | ------------------ |
| Sprint 1 | US1, US2, US3, US7 |
| Sprint 2 | US4, US5, US6      |

**Total: 20 Story Points**
