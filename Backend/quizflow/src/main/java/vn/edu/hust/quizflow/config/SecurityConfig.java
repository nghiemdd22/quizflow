package vn.edu.hust.quizflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import vn.edu.hust.quizflow.security.JwtAuthenticationFilter;

/**
 * Lớp cấu hình bảo mật chính (Spring Security Configuration) của ứng dụng.
 * Kích hoạt bảo mật Web Security và thiết lập các chính sách phân quyền, xác thực dạng Stateless (không trạng thái) dùng JWT.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Định nghĩa bộ lọc bảo mật chính SecurityFilterChain.
     * Cấu hình phân quyền endpoint, vô hiệu hóa CSRF, xác định chính sách Session và thêm Filter JWT.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Vô hiệu hóa CSRF vì ứng dụng sử dụng cơ chế RESTful API (xác thực qua JWT, không dùng cookie)
            .csrf(csrf -> csrf.disable())
            
            // Không sử dụng Session trong Servlet container (đưa về trạng thái stateless)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Định cấu hình phân quyền các request HTTP gửi đến
            .authorizeHttpRequests(auth -> auth
                // Các endpoint API đăng nhập, đăng ký (/api/v1/auth/**) được phép truy cập tự do không cần token
                .requestMatchers("/api/v1/auth/**").permitAll()
                // Cho phép truy cập tự do vào các metric giám sát hệ thống của Actuator
                .requestMatchers("/actuator/**").permitAll()
                // Tất cả các request còn lại bắt buộc phải xác thực (phải đăng nhập)
                .anyRequest().authenticated()
            )
            // Thêm Filter xác thực JWT tự chế (jwtAuthenticationFilter) vào trước Filter xác thực mặc định của Spring
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Định nghĩa Bean mã hóa mật khẩu, sử dụng thuật toán băm BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Định nghĩa Bean quản lý xác thực (AuthenticationManager) dùng để thực hiện đăng nhập trong controller.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
