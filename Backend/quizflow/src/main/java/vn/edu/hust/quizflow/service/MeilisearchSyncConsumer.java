package vn.edu.hust.quizflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import vn.edu.hust.quizflow.config.RabbitMQConfig;
import vn.edu.hust.quizflow.dto.message.PostSyncMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeilisearchSyncConsumer {

    private final Client meilisearchClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @RabbitListener(queues = RabbitMQConfig.MEILISEARCH_SYNC_QUEUE)
    public void syncPostToMeilisearch(PostSyncMessage message) {
        try {
            log.info("Received sync message for post ID: {}", message.getId());
            
            Index index = meilisearchClient.index("posts");
            String document = objectMapper.writeValueAsString(message);
            
            index.addDocuments(document);
            
            log.info("Successfully synced post {} to Meilisearch", message.getId());
        } catch (Exception e) {
            log.error("Failed to sync post {} to Meilisearch: {}", message.getId(), e.getMessage());
        }
    }
}
