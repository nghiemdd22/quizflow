package vn.edu.hust.quizflow.config;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Lớp cấu hình (Configuration) cho Meilisearch.
 * Thiết lập kết nối tới Meilisearch server để hỗ trợ tính năng tìm kiếm full-text cực nhanh.
 * Đọc thông tin host và API key từ file cấu hình (hoặc sử dụng giá trị mặc định nếu không có).
 */
@Configuration
public class MeilisearchConfig {

    @Value("${meilisearch.host:http://localhost:7700}")
    private String host;

    @Value("${meilisearch.api-key:MASTER_KEY_VDT_2024}")
    private String apiKey;

    /**
     * Tạo và cấu hình Bean Client của Meilisearch.
     * Bean này sẽ được tiêm (inject) vào các Service để thực hiện các thao tác:
     * thêm, sửa, xóa, và tìm kiếm dữ liệu (ví dụ: tìm kiếm câu hỏi, lớp học) trên Meilisearch.
     *
     * @return Đối tượng Client đã thiết lập kết nối với Meilisearch server.
     */
    @Bean
    public Client meilisearchClient() {
        return new Client(new Config(host, apiKey));
    }
}
