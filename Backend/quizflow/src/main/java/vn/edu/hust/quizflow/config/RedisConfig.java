package vn.edu.hust.quizflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Lớp cấu hình cho Redis trong ứng dụng Spring Boot.
 * Annotation @Configuration đánh dấu lớp này là một phần cấu hình,
 * nơi định nghĩa và khởi tạo các bean cho Spring application context.
 */
@Configuration
public class RedisConfig {

    /**
     * Cấu hình và tạo ra một bean RedisTemplate để tương tác với Redis.
     * RedisTemplate cung cấp các phương thức tiện ích ở mức cao để thao tác với dữ
     * liệu
     * trong Redis mà không cần phải làm việc trực tiếp với các lệnh Redis cấp thấp.
     *
     * @param connectionFactory factory quản lý kết nối tới Redis server (được
     *                          Spring tự động cấu hình)
     * @return đối tượng RedisTemplate đã được thiết lập các cấu hình tuần tự hóa
     *         (serializer) phù hợp
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();

        // Thiết lập connection factory để template có thể kết nối với Redis
        template.setConnectionFactory(connectionFactory);

        // Cấu hình Serializer cho Key (khóa)
        // Sử dụng StringRedisSerializer để đảm bảo các key lưu trong Redis ở dạng chuỗi
        // văn bản thuần túy (plain text).
        // Điều này giúp dễ dàng đọc, kiểm tra và debug dữ liệu trực tiếp thông qua công
        // cụ redis-cli.
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Cấu hình Serializer cho Value (giá trị)
        // Sử dụng GenericJackson2JsonRedisSerializer để tự động chuyển đổi (serialize)
        // các đối tượng Java
        // thành chuỗi định dạng JSON khi lưu trữ vào Redis và ngược lại (deserialize)
        // khi lấy dữ liệu ra.
        // Nhờ vậy, ta có thể lưu trữ và truy xuất các đối tượng dữ liệu phức tạp một
        // cách dễ dàng và linh hoạt.
        template.setValueSerializer(RedisSerializer.json());
        template.setHashValueSerializer(RedisSerializer.json());
        return template;
    }
}
