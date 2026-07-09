package vn.edu.hust.quizflow.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Lớp cấu hình (Configuration) cho dịch vụ lưu trữ đám mây Cloudinary.
 * Đọc các thông tin xác thực từ file cấu hình (ví dụ: application.yml, .env) 
 * và khởi tạo đối tượng Cloudinary để quản lý việc upload và lưu trữ file (ảnh, tài liệu...).
 */
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Tạo và cấu hình Bean Cloudinary.
     * Bean này sẽ được Spring Context quản lý và có thể được inject vào các Service
     * để thực hiện các thao tác giao tiếp trực tiếp với Cloudinary API.
     *
     * @return Đối tượng Cloudinary đã được thiết lập các thông số bảo mật.
     */
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }
}
