package vn.edu.hust.quizflow.service.scoring;

import vn.edu.hust.quizflow.entity.QuestionType;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Interface (Mẫu) cho tất cả các chiến lược chấm điểm.
 * Mẫu thiết kế Strategy Pattern: Định nghĩa tập hợp các thuật toán, đóng gói
 * từng thuật toán vào một lớp riêng biệt,
 * và làm cho chúng có thể hoán đổi cho nhau.
 */
public interface ScoringStrategy {
    /**
     * Xác định loại câu hỏi mà Strategy này hỗ trợ.
     */
    QuestionType getSupportedType();

    /**
     * Chấm điểm cho 1 câu hỏi.
     * 
     * @param studentAnswer    Đáp án của học sinh (từ Redis)
     * @param questionMetadata Cấu trúc metadata của câu hỏi (chứa correctAnswers)
     * @param maxScore         Điểm tối đa của câu hỏi này (ví dụ: 1.0)
     * @return Điểm số đạt được (từ 0.0 đến maxScore)
     */
    BigDecimal calculateScore(Object studentAnswer, Map<String, Object> questionMetadata, BigDecimal maxScore);
}
