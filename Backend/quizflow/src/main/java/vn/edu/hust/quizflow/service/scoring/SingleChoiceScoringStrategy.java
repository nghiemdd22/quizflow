package vn.edu.hust.quizflow.service.scoring;

import org.springframework.stereotype.Component;
import vn.edu.hust.quizflow.entity.QuestionType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Chiến lược chấm điểm dành riêng cho loại câu hỏi TRẮC NGHIỆM 1 LỰA CHỌN
 * (Single Choice).
 * Thuộc mẫu thiết kế Strategy Pattern.
 */
@Component
public class SingleChoiceScoringStrategy implements ScoringStrategy {

    /**
     * Đăng ký với hệ thống: Class này chuyên trị loại câu hỏi SINGLE.
     */
    @Override
    public QuestionType getSupportedType() {
        return QuestionType.SINGLE;
    }

    /**
     * Thuật toán chấm điểm câu Trắc nghiệm 1 lựa chọn.
     * Thuật toán này đơn giản nhất: So sánh chuỗi (String) khớp 100% thì ăn trọn
     * điểm.
     */
    @Override
    @SuppressWarnings("unchecked")
    public BigDecimal calculateScore(Object studentAnswer, Map<String, Object> questionMetadata, BigDecimal maxScore) {
        // Học sinh không chọn gì -> 0 điểm
        if (studentAnswer == null) {
            return BigDecimal.ZERO;
        }

        // Lấy danh sách đáp án đúng từ DB. Dù là SINGLE nhưng cấu trúc DB vẫn lưu dưới
        // dạng List để dùng chung.
        List<?> correctAnswers = (List<?>) questionMetadata.get("correctAnswers");
        if (correctAnswers == null || correctAnswers.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Vì là trắc nghiệm 1 lựa chọn, nên đáp án đúng duy nhất chắc chắn nằm ở phần
        // tử đầu tiên (index 0)
        String correctAnswer = String.valueOf(correctAnswers.get(0));

        // Chuyển đáp án học sinh gửi lên thành kiểu String (VD: "A", "B", "1716584213")
        String submittedAnswer = String.valueOf(studentAnswer);

        // So sánh chính xác tuyệt đối (không phân biệt chữ thường/hoa như câu Điền từ,
        // vì ID đáp án là cố định)
        if (correctAnswer.equals(submittedAnswer)) {
            return maxScore;
        }

        return BigDecimal.ZERO;
    }
}
