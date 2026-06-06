package vn.edu.hust.quizflow.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Swagger/OpenAPI 3.
 * Định nghĩa thông tin chung của API và cấu hình nút "Authorize" để truyền JWT Token.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "QuizFlow API", version = "v1", description = "Tài liệu API cho dự án nền tảng Quiz trực tuyến"),
        security = @SecurityRequirement(name = "bearerAuth") // Yêu cầu áp dụng security tên 'bearerAuth' cho tất cả endpoint (ngoại trừ những cái được public)
)
@SecurityScheme(
        name = "bearerAuth", // Tên của security scheme
        type = SecuritySchemeType.HTTP, // Kiểu HTTP
        scheme = "bearer", // Loại token là Bearer
        bearerFormat = "JWT" // Định dạng token là JWT
)
public class OpenAPIConfig {
}
