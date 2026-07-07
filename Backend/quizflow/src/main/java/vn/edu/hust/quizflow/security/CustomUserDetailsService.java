package vn.edu.hust.quizflow.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.util.Collections;

/**
 * Lớp CustomUserDetailsService thực thi interface UserDetailsService của Spring Security.
 * Chịu trách nhiệm tìm và lấy thông tin người dùng từ cơ sở dữ liệu khi xác thực.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Tải thông tin người dùng dựa trên tên đăng nhập (username).
     * Chuyển đổi đối tượng User của hệ thống thành đối tượng UserDetails tương thích với Spring Security.
     *
     * @param username tên đăng nhập người dùng gửi lên
     * @return đối tượng UserDetails chứa username, mật khẩu đã mã hóa và danh sách quyền (Authorities)
     * @throws UsernameNotFoundException nếu không tìm thấy người dùng
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với username: " + username));

        // Ánh xạ vai trò (role) của User sang định dạng quyền Spring Security (ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN)
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                user.isActive(), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
