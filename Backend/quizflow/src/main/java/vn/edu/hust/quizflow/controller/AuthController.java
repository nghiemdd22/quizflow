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
     * @param request thông tin đăng nhập từ client
     * @return ResponseEntity chứa JWT token và thông tin người dùng với mã trạng thái 200 OK
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Trả về lỗi 401 Unauthorized nếu đăng nhập thất bại (sai tên/mật khẩu)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Tên đăng nhập hoặc mật khẩu không chính xác!"
            ));
        }
    }
}
