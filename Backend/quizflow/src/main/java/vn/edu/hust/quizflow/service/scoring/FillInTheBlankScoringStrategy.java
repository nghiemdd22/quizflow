package vn.edu.hust.quizflow.service.scoring;

import org.springframework.stereotype.Component;
import vn.edu.hust.quizflow.entity.QuestionType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Chiến lược chấm điểm dành riêng cho loại câu hỏi ĐIỀN VÀO CHỖ TRỐNG (Fill in the Blank).
 * Thuộc mẫu thiết kế Strategy Pattern. Class này được Spring tự động nạp (@Component).
 */
@Component
public class FillInTheBlankScoringStrategy implements ScoringStrategy {

    /**
     * Khai báo cho Factory biết: Class này sinh ra là để xử lý loại câu hỏi FILL.
     */
    @Override
    public QuestionType getSupportedType() {
        return QuestionType.FILL;
    }

    /**
     * Thuật toán chấm điểm câu Điền từ.
     * Điểm đặc biệt: Rất "bao dung" với học sinh nhờ cơ chế chuẩn hóa chuỗi (Xóa khoảng trắng thừa, hạ chữ thường).
     */
    @Override
    @SuppressWarnings("unchecked")
    public BigDecimal calculateScore(Object studentAnswer, Map<String, Object> questionMetadata, BigDecimal maxScore) {
        // Nếu học sinh bỏ trống (không làm), điểm = 0
        if (studentAnswer == null) {
            return BigDecimal.ZERO;
        }

        // Lấy danh sách TẤT CẢ CÁC ĐÁP ÁN ĐÚNG CÓ THỂ CHẤP NHẬN ĐƯỢC từ Database.
        // VD: Đáp án có thể là ["Hà Nội", "ha noi", "thủ đô hà nội"]
        List<?> correctAnswersRaw = (List<?>) questionMetadata.get("correctAnswers");
        if (correctAnswersRaw == null || correctAnswersRaw.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Ép kiểu đáp án của học sinh về dạng Text.
        // Dùng .trim() để cắt sạch khoảng trắng bị dư ở 2 đầu (nếu học sinh lỡ tay gõ phím cách).
        // Dùng .toLowerCase() để ép toàn bộ về chữ thường, bỏ qua lỗi viết hoa/thường.
        String submittedAnswer = String.valueOf(studentAnswer).trim().toLowerCase();

        // Duyệt qua danh sách đáp án đúng. 
        // Chỉ cần đáp án của học sinh khớp với BẤT KỲ một phương án nào trong danh sách thì cho điểm tối đa ngay lập tức.
        for (Object correctObj : correctAnswersRaw) {
            String correctAnswer = String.valueOf(correctObj);
            if (correctAnswer.trim().toLowerCase().equals(submittedAnswer)) {
                return maxScore;
            }
        }

        // Nếu chạy hết vòng lặp mà không khớp cái nào -> Sai, 0 điểm.
        return BigDecimal.ZERO;
    }
}
