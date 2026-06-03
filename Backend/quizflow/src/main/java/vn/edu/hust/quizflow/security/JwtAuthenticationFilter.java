package vn.edu.hust.quizflow.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Bộ lọc xác thực JWT (Filter) chặn mọi request gửi tới API.
 * Kế thừa OncePerRequestFilter để đảm bảo mỗi request chỉ được lọc đúng 1 lần.
 * Nhiệm vụ chính: Trích xuất JWT từ Header Authorization, kiểm tra tính hợp lệ và thiết lập thông tin đăng nhập vào Spring Security Context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, CustomUserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Thực hiện logic lọc và kiểm tra token của từng request.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Lấy thông tin Header Authorization từ request gửi lên
        String authHeader = request.getHeader("Authorization");

        // Token hợp lệ phải bắt đầu bằng chuỗi "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Cắt bỏ chuỗi "Bearer " để lấy token JWT thuần túy
            String jwtToken = authHeader.substring(7);
            
            // Kiểm tra tính hợp lệ của token
            if (jwtUtils.validateToken(jwtToken)) {
                // Trích xuất username từ token
                String username = jwtUtils.getUsernameFromToken(jwtToken);
                
                // Nếu lấy được username và tài khoản chưa được thiết lập xác thực trong Context hiện tại
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Lấy chi tiết thông tin người dùng từ cơ sở dữ liệu
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    // Tạo đối tượng chứa thông tin xác thực
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    // Đính kèm các thông tin bổ sung của request (IP, session...)
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Thiết lập quyền hạn và trạng thái đăng nhập thành công vào ngữ cảnh bảo mật của ứng dụng
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        // Chuyển tiếp request đến bộ lọc tiếp theo trong chuỗi Filter Chain
        filterChain.doFilter(request, response);
    }
}
