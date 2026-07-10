package vn.edu.hust.quizflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.stereotype.Service;
import vn.edu.hust.quizflow.config.RabbitMQConfig;
import vn.edu.hust.quizflow.dto.message.PostSyncMessage;

/**
 * Worker chạy ngầm chuyên chịu trách nhiệm lắng nghe tin nhắn từ RabbitMQ
 * và đồng bộ dữ liệu bài viết mới lên máy chủ Meilisearch để phục vụ tìm kiếm.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MeilisearchSyncConsumer {

    private final Client meilisearchClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Hàm này luôn túc trực lắng nghe trên hàng đợi MEILISEARCH_SYNC_QUEUE.
     * Ngay khi có một PostSyncMessage bay vào, nó sẽ lập tức "bắt" lấy và xử lý.
     *
     * @param message Gói tin chứa thông tin bài viết (id, title, content, tags...)
     */
    @RabbitListener(queues = RabbitMQConfig.MEILISEARCH_SYNC_QUEUE)
    public void syncPostToMeilisearch(PostSyncMessage message) {
        try {
            log.info("Received sync message for post ID: {}", message.getId());
            
            // 1. Kết nối tới "Kho lưu trữ" (Index) trong Meilisearch tên là "posts"
            Index index = meilisearchClient.index("posts");
            
            // 2. Chuyển đổi đối tượng Java thành chuỗi JSON nguyên bản
            String document = objectMapper.writeValueAsString(message);
            
            // 3. Đẩy chuỗi JSON này vào máy chủ Meilisearch để tiến hành lập chỉ mục (Index)
            index.addDocuments(document);
            
            log.info("Successfully synced post {} to Meilisearch", message.getId());
        } catch (Exception e) {
            log.error("Failed to sync post {} to Meilisearch: {}", message.getId(), e.getMessage());
            // Ném ra ngoại lệ AmqpRejectAndDontRequeueException:
            // Báo cho RabbitMQ biết là "Lỗi nặng rồi, hãy vứt gói tin này đi, đừng nhét lại vào hàng đợi nữa kẻo bị lặp vô hạn"
            throw new AmqpRejectAndDontRequeueException("Meilisearch sync failed for post " + message.getId(), e);
        }
    }
}
