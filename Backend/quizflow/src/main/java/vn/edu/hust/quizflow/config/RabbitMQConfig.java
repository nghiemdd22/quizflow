package vn.edu.hust.quizflow.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Lớp cấu hình hạ tầng RabbitMQ cho dự án Spring Boot.
 * Chịu trách nhiệm khởi tạo các thành phần cốt lõi của Message Broker bao gồm:
 * - Direct Exchange: Nơi nhận message từ Producer và định tuyến (route) dựa trên Binding Key.
 * - Queue: Hàng đợi lưu trữ message nộp bài của học sinh.
 * - Dead Letter Queue (DLQ): Hàng đợi đặc biệt để hứng các message bị lỗi trong quá trình xử lý, giúp không bị mất mát dữ liệu.
 */
@Configuration
public class RabbitMQConfig {

    // Khai báo tên cho các thành phần của luồng nộp bài chính (Main Queue)
    public static final String SUBMIT_EXAM_QUEUE = "quiz.submit.queue";
    public static final String SUBMIT_EXAM_EXCHANGE = "quiz.submit.exchange";
    public static final String SUBMIT_EXAM_ROUTING_KEY = "quiz.submit.routing.key";

    // Khai báo tên cho các thành phần của luồng xử lý lỗi (Dead Letter Queue)
    public static final String SUBMIT_EXAM_DLQ = "quiz.submit.dlq";
    public static final String SUBMIT_EXAM_DLX = "quiz.submit.dlx";
    public static final String SUBMIT_EXAM_DLQ_ROUTING_KEY = "quiz.submit.dlq.routing.key";

    // Khai báo Queue đồng bộ Meilisearch
    public static final String MEILISEARCH_SYNC_QUEUE = "meilisearch.sync.queue";
    public static final String MEILISEARCH_SYNC_EXCHANGE = "meilisearch.sync.exchange";
    public static final String MEILISEARCH_SYNC_ROUTING_KEY = "meilisearch.sync.routing.key";

    // ==========================================
    // CẤU HÌNH LUỒNG NỘP BÀI CHÍNH (MAIN CONFIG)
    // ==========================================

    /**
     * Khởi tạo Direct Exchange cho luồng nộp bài.
     * Direct Exchange định tuyến message chính xác đến Queue có Routing Key trùng khớp 100%.
     */
    @Bean
    public DirectExchange submitExamExchange() {
        return new DirectExchange(SUBMIT_EXAM_EXCHANGE);
    }

    /**
     * Khởi tạo Hàng đợi (Queue) lưu trữ bài làm.
     * durable(true): Đảm bảo Queue không bị mất khi RabbitMQ khởi động lại.
     * Đặc biệt: Cấu hình x-dead-letter-exchange để chỉ định nơi chứa message nếu nó bị lỗi hoặc từ chối (Reject).
     */
    @Bean
    public Queue submitExamQueue() {
        return QueueBuilder.durable(SUBMIT_EXAM_QUEUE)
                .withArgument("x-dead-letter-exchange", SUBMIT_EXAM_DLX)
                .withArgument("x-dead-letter-routing-key", SUBMIT_EXAM_DLQ_ROUTING_KEY)
                .build();
    }

    /**
     * Ràng buộc (Binding) giữa Main Queue và Main Exchange thông qua Routing Key.
     */
    @Bean
    public Binding submitExamBinding(Queue submitExamQueue, DirectExchange submitExamExchange) {
        return BindingBuilder.bind(submitExamQueue).to(submitExamExchange).with(SUBMIT_EXAM_ROUTING_KEY);
    }

    // ==========================================
    // CẤU HÌNH LUỒNG XỬ LÝ LỖI (DEAD LETTER CONFIG)
    // ==========================================

    /**
     * Khởi tạo Exchange riêng cho các message bị hỏng (Dead Letter Exchange).
     */
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(SUBMIT_EXAM_DLX);
    }

    /**
     * Khởi tạo Dead Letter Queue (DLQ).
     * Đây là "thùng rác an toàn" lưu trữ tạm thời các bài nộp bị lỗi để Admin có thể xem xét và Retry lại sau.
     */
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(SUBMIT_EXAM_DLQ).build();
    }

    /**
     * Ràng buộc (Binding) giữa DLQ và DLX thông qua DLQ Routing Key.
     */
    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with(SUBMIT_EXAM_DLQ_ROUTING_KEY);
    }

    // ==========================================
    // CẤU HÌNH LUỒNG ĐỒNG BỘ MEILISEARCH
    // ==========================================

    @Bean
    public DirectExchange meilisearchSyncExchange() {
        return new DirectExchange(MEILISEARCH_SYNC_EXCHANGE);
    }

    @Bean
    public Queue meilisearchSyncQueue() {
        return QueueBuilder.durable(MEILISEARCH_SYNC_QUEUE).build();
    }

    @Bean
    public Binding meilisearchSyncBinding(Queue meilisearchSyncQueue, DirectExchange meilisearchSyncExchange) {
        return BindingBuilder.bind(meilisearchSyncQueue).to(meilisearchSyncExchange).with(MEILISEARCH_SYNC_ROUTING_KEY);
    }

    // ==========================================
    // CẤU HÌNH BỘ CHUYỂN ĐỔI DỮ LIỆU (MESSAGE CONVERTER)
    // ==========================================

    /**
     * Khởi tạo bộ chuyển đổi JacksonJsonMessageConverter.
     * - Ở phía Producer: Tự động chuyển đổi đối tượng Java (SubmitExamMessage) thành chuỗi JSON.
     * - Ở phía Consumer: Tự động parse chuỗi JSON từ Queue về lại đối tượng Java.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
