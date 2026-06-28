package vn.edu.hust.quizflow.dto.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Gói tin xác nhận (ACK) gửi về cho học sinh sau khi đáp án được lưu thành công vào Redis.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerAckMessage {
    private Long questionId;
    private String status;
}
