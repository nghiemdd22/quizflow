package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hust.quizflow.dto.AuthResponse;
import vn.edu.hust.quizflow.dto.LoginRequest;
import vn.edu.hust.quizflow.dto.RegisterRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.CookieValue;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.service.AuthService;

import java.util.Map;

/**
 * Controller chịu trách nhiệm định tuyến các yêu cầu xác thực (Đăng ký, Đăng nhập).
 * Được cấu hình permitAll() trong Spring Security.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint xử lý yêu cầu đăng ký tài khoản mới.
     * URL: POST http://localhost:8080/api/v1/auth/register
     *
     * @param request dữ liệu đăng ký gửi từ client
     * @return ResponseEntity chứa thông tin kết quả thành công và mã trạng thái 201 CREATED
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User registeredUser = authService.register(request);
            // Trả về DTO đơn giản để bảo mật thông tin nhạy cảm (không trả về password_hash)
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Đăng ký tài khoản thành công!",
                    "username", registeredUser.getUsername(),
                    "fullName", registeredUser.getFullName(),
                    "role", registeredUser.getRole()
            ));
        } catch (IllegalArgumentException e) {
            // Trả về lỗi 400 Bad Request nếu trùng username hoặc thông tin không hợp lệ
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint xử lý yêu cầu đăng nhập tài khoản.
     * URL: POST http://localhost:8080/api/v1/auth/login
     *
     * @param request thông tin đăng nhập từ client (username, password)
     * @param response đối tượng HttpServletResponse dùng để thiết lập HttpOnly Cookie
     * @return ResponseEntity chứa Access Token dạng JSON và cài đặt Refresh Token vào Cookie
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);

            Cookie refreshCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // In production, set to true for HTTPS
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(refreshCookie);

            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            // Trả về lỗi 401 Unauthorized nếu đăng nhập thất bại (sai tên/mật khẩu)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Tên đăng nhập hoặc mật khẩu không chính xác!"
            ));
        }
    }

    /**
     * Endpoint xử lý yêu cầu làm mới Access Token (Refresh Token mechanism).
     * URL: POST http://localhost:8080/api/v1/auth/refresh
     * 
     * Quá trình hoạt động:
     * 1. Trích xuất Refresh Token từ HttpOnly Cookie do trình duyệt tự động đính kèm.
     * 2. Truy xuất CSDL để kiểm tra tính hợp lệ, hết hạn và trạng thái thu hồi.
     * 3. Trả về Access Token mới và cấp phát lại (rotate) Refresh Token mới vào Cookie.
     *
     * @param refreshToken chuỗi token tự động được Spring lấy từ Cookie có tên "refreshToken"
     * @param response đối tượng HttpServletResponse để cập nhật lại Cookie mới
     * @return ResponseEntity chứa Access Token mới hoặc lỗi 401 nếu thất bại
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Không tìm thấy Refresh Token trong Cookie"));
        }
        try {
            AuthResponse authResponse = authService.refresh(refreshToken);
            
            Cookie refreshCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(refreshCookie);

            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            Cookie deleteCookie = new Cookie("refreshToken", null);
            deleteCookie.setHttpOnly(true);
            deleteCookie.setPath("/");
            deleteCookie.setMaxAge(0);
            response.addCookie(deleteCookie);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint xử lý yêu cầu đăng xuất.
     * URL: POST http://localhost:8080/api/v1/auth/logout
     * 
     * Thực hiện xóa bỏ phiên đăng nhập bằng cách gửi một HttpOnly Cookie mới
     * có cùng tên "refreshToken" nhưng thời gian sống (MaxAge) bằng 0 để yêu cầu
     * trình duyệt xóa bỏ Cookie cũ.
     *
     * @param response đối tượng HttpServletResponse để thiết lập lệnh xóa Cookie
     * @return ResponseEntity thông báo đăng xuất thành công
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie deleteCookie = new Cookie("refreshToken", null);
        deleteCookie.setHttpOnly(true);
        deleteCookie.setPath("/");
        deleteCookie.setMaxAge(0);
        response.addCookie(deleteCookie);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
}
