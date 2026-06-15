package vn.edu.hust.quizflow.service.scoring;

import org.springframework.stereotype.Component;
import vn.edu.hust.quizflow.entity.QuestionType;

import java.math.BigDecimal;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Chiến lược chấm điểm dành riêng cho loại câu hỏi TRẮC NGHIỆM NHIỀU ĐÁP ÁN
 * (Multiple Choice).
 * Thuộc mẫu thiết kế Strategy Pattern.
 */
@Component
public class MultipleChoiceScoringStrategy implements ScoringStrategy {

    /**
     * Đăng ký với hệ thống: Class này chuyên trị loại câu hỏi MULTIPLE.
     */
    @Override
    public QuestionType getSupportedType() {
        return QuestionType.MULTIPLE;
    }

    /**
     * Thuật toán chấm điểm câu Trắc nghiệm nhiều lựa chọn.
     * Áp dụng nguyên tắc "All or Nothing" (Đúng toàn bộ hoặc không có điểm).
     * Điểm đặc biệt: Sử dụng cấu trúc dữ liệu Set để so sánh, bỏ qua thứ tự chọn
     * đáp án của học sinh.
     */
    @Override
    @SuppressWarnings("unchecked")
    public BigDecimal calculateScore(Object studentAnswer, Map<String, Object> questionMetadata, BigDecimal maxScore) {
        // Đối với câu MULTIPLE, đáp án gửi lên bắt buộc phải là một danh sách (List).
        // Nếu sai định dạng -> 0 điểm.
        if (studentAnswer == null || !(studentAnswer instanceof List)) {
            return BigDecimal.ZERO;
        }

        // Kéo danh sách đáp án chuẩn từ Database (VD: ["A", "B", "C"])
        List<?> correctAnswersRaw = (List<?>) questionMetadata.get("correctAnswers");
        if (correctAnswersRaw == null || correctAnswersRaw.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<?> submittedAnswersRaw = (List<?>) studentAnswer;

        // BƯỚC TỐI ƯU QUAN TRỌNG: Chuyển đổi List (Mảng) sang Set (Tập hợp) String
        Set<String> correctAnswersSet = correctAnswersRaw.stream()
                .map(String::valueOf)
                .collect(Collectors.toSet());
        Set<String> submittedAnswersSet = submittedAnswersRaw.stream()
                .map(String::valueOf)
                .collect(Collectors.toSet());

        // So sánh 2 tập hợp. Nếu khớp nhau 100% về số lượng và phần tử thì mới cho điểm
        // tuyệt đối.
        if (correctAnswersSet.equals(submittedAnswersSet)) {
            return maxScore;
        }

        // Nếu thừa 1 đáp án sai, hoặc thiếu 1 đáp án đúng -> Cho 0 điểm. (Không có điểm
        // thành phần).
        return BigDecimal.ZERO;
    }
}
