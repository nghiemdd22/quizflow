package vn.edu.hust.quizflow.dto.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Lớp DTO (Data Transfer Object) đóng vai trò là Message Payload.
 * Chứa toàn bộ thông tin bài làm của học sinh để gửi vào hàng đợi RabbitMQ.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitExamMessage {
    
    /**
     * ID của học sinh đang nộp bài.
     */
    private Long studentId;
    
    /**
     * ID của ca thi mà học sinh đang tham gia.
     */
    private Long examSessionId;
    
    /**
     * Map chứa danh sách các câu trả lời của học sinh.
     * - Key (Long): ID của câu hỏi.
     * - Value (Object): Đáp án học sinh chọn.
     *   + Có thể là ID của Option (nếu là trắc nghiệm 1 đáp án).
     *   + Có thể là List các ID Option (nếu là trắc nghiệm nhiều đáp án).
     *   + Có thể là chuỗi Text (nếu là câu hỏi điền khuyết).
     */
    private Map<Long, Object> answers;
}
