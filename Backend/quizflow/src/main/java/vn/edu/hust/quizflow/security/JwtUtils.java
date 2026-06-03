package vn.edu.hust.quizflow.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * Lớp tiện ích cung cấp các hàm hỗ trợ JSON Web Token (JWT):
 * Tạo token, giải mã token và xác thực token khi người dùng gửi request.
 */
@Component
public class JwtUtils {

    // Khóa bí mật dùng để ký và xác thực token JWT, được cấu hình trong application.yaml
    @Value("${jwt.secret:quizflowjwtsecretkey2026hustuniversity}")
    private String jwtSecret;

    // Thời gian hết hạn của token (tính bằng mili-giây), mặc định là 24 giờ
    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    /**
     * Tạo một token JWT mới chứa thông tin username và role của người dùng.
     *
     * @param username tên đăng nhập của người dùng
     * @param role vai trò quyền hạn của người dùng (TEACHER / STUDENT)
     * @return chuỗi token JWT hoàn chỉnh đã được ký
     */
    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return JWT.create()
                .withSubject(username) // Lưu username vào claim 'sub'
                .withClaim("role", role) // Lưu role vào custom claim 'role'
                .withIssuedAt(now) // Ghi nhận thời điểm phát hành token
                .withExpiresAt(expiryDate) // Thiết lập thời điểm hết hạn
                .sign(Algorithm.HMAC256(jwtSecret)); // Ký token bằng thuật toán HMAC-SHA256
    }

    /**
     * Lấy thông tin tên đăng nhập (username) từ một token JWT.
     */
    public String getUsernameFromToken(String token) {
        DecodedJWT decodedJWT = decodeToken(token);
        return decodedJWT.getSubject();
    }

    /**
     * Lấy thông tin vai trò (role) của người dùng từ token JWT.
     */
    public String getRoleFromToken(String token) {
        DecodedJWT decodedJWT = decodeToken(token);
        return decodedJWT.getClaim("role").asString();
    }

    /**
     * Kiểm tra xem token JWT gửi lên có hợp lệ hay không (đúng chữ ký, còn hạn sử dụng...).
     */
    public boolean validateToken(String token) {
        try {
            decodeToken(token);
            return true;
        } catch (Exception e) {
            // Token không hợp lệ, hết hạn hoặc sai chữ ký
            return false;
        }
    }

    /**
     * Giải mã token JWT sử dụng khóa bí mật.
     */
    private DecodedJWT decodeToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
        JWTVerifier verifier = JWT.require(algorithm).build();
        return verifier.verify(token);
    }
}
