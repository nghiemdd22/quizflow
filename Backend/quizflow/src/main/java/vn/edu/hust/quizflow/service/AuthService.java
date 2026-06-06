package vn.edu.hust.quizflow.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.AuthResponse;
import vn.edu.hust.quizflow.dto.LoginRequest;
import vn.edu.hust.quizflow.dto.RegisterRequest;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.UserRepository;
import vn.edu.hust.quizflow.security.JwtUtils;

/**
 * Lớp xử lý nghiệp vụ liên quan đến xác thực tài khoản (Đăng ký, Đăng nhập).
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, 
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Đăng ký tài khoản người dùng mới.
     * Mật khẩu sẽ được băm BCrypt, CCCD và Số điện thoại tự động mã hóa AES-256 qua JPA Converter.
     *
     * @param request thông tin đăng ký gửi từ client
     * @return đối tượng User đã được lưu trữ trong DB
     */
    @Transactional
    public User register(RegisterRequest request) {
        // Kiểm tra xem tên tài khoản đã tồn tại trong hệ thống chưa
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại trong hệ thống!");
        }

        // Xử lý gán Role dựa trên Invite Code
        vn.edu.hust.quizflow.entity.UserRole finalRole = vn.edu.hust.quizflow.entity.UserRole.STUDENT;
        if (request.getInviteCode() != null && !request.getInviteCode().trim().isEmpty()) {
            if ("SCHOOL-TEACHER-2026".equals(request.getInviteCode().trim())) {
                finalRole = vn.edu.hust.quizflow.entity.UserRole.TEACHER;
            } else {
                throw new IllegalArgumentException("Mã lời mời (Invite Code) không hợp lệ!");
            }
        }

        // Tạo đối tượng thực thể User mới
        User user = User.builder()
                .username(request.getUsername())
                // Băm mật khẩu bằng BCrypt
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(finalRole)
                // Các trường cccd và phone được truyền vào dưới dạng rõ, JPA Converter sẽ tự động mã hóa AES-256
                .cccdEncrypted(request.getIdentityCard())
                .phoneEncrypted(request.getPhone())
                .build();

        return userRepository.save(user);
    }

    /**
     * Xác thực thông tin đăng nhập và cấp phát mã token JWT.
     *
     * @param request thông tin đăng nhập (username, password)
     * @return DTO kết quả chứa JWT token và thông tin cơ bản người dùng
     */
    public AuthResponse login(LoginRequest request) {
        // Thực hiện xác thực thông qua AuthenticationManager của Spring Security
        // Spring Security sẽ tự động gọi CustomUserDetailsService để load và so sánh mật khẩu băm
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Lấy thông tin chi tiết người dùng từ database sau khi xác thực thành công
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người dùng!"));

        // Sinh mã token JWT dựa trên username và role
        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        // Đóng gói kết quả trả về
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
