package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hust.quizflow.entity.UserRole;

/**
 * DTO trả về kết quả xác thực thành công chứa token JWT và thông tin cơ bản của user.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    /**
     * ID của người dùng trong hệ thống (dùng cho các truy vấn dữ liệu sau này).
     */
    private Long id;

    /**
     * Access Token (JWT) được dùng để xác thực các API Requests tiếp theo.
     * Frontend sẽ lưu token này vào RAM (Zustand/Redux/Context API).
     */
    private String token;

    /**
     * Tên đăng nhập của người dùng.
     */
    private String username;

    /**
     * Họ và tên hiển thị của người dùng.
     */
    private String fullName;

    /**
     * Vai trò của người dùng (TEACHER / STUDENT) dùng để phân quyền hiển thị UI phía Frontend.
     */
    private UserRole role;

    /**
     * Refresh Token (chuỗi ngẫu nhiên lưu trong Database).
     * Thuộc tính này bị bỏ qua khi parse ra JSON trả về (nhờ annotation @JsonIgnore)
     * vì theo cơ chế bảo mật, Refresh Token phải được gửi ngầm qua HttpOnly Cookie thay vì trả về trong Body.
     * Biến này chỉ tồn tại trong đối tượng Java để AuthController lấy dữ liệu cài vào Cookie.
     */
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String refreshToken;
}
