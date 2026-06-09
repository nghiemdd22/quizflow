package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hust.quizflow.entity.QuestionType;

import java.util.Map;

/**
 * Data Transfer Object (DTO) dùng để gửi danh sách câu hỏi về cho học sinh
 * (Frontend).
 * BẢO MẬT: DTO này là lớp áo giáp bảo vệ, đảm bảo rằng đáp án đúng
 * (correctAnswers)
 * sẽ bị xóa bỏ hoàn toàn trước khi gửi qua mạng internet.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuestionDTO {

    // ID của câu hỏi trong Database (Dùng để sau này học sinh gửi kèm theo đáp án
    // đã chọn)
    private Long id;

    // Loại câu hỏi: SINGLE (1 đáp án), MULTIPLE (nhiều đáp án), FILL (điền
    // khuyết)
    private QuestionType type;

    // Nội dung text của câu hỏi
    private String content;

    // Siêu dữ liệu chứa cấu trúc chi tiết của câu hỏi (dưới dạng JSON Map).
    // RẤT QUAN TRỌNG:
    // - Trường này CHỈ chứa danh sách các lựa chọn (options) để hiển thị lên UI.
    // - Lập trình viên Backend đã chủ động DÙNG LỆNH REMOVE để xóa key
    // "correctAnswers" khỏi Map này
    // trước khi gán vào DTO (xem trong ExamSessionService).
    // - Nhờ vậy, dù học sinh có rành IT, bấm F12 soi Network hay Inspect HTML thì
    // cũng KHÔNG THỂ
    // tìm thấy đáp án đúng bị lộ ra ngoài.
    private Map<String, Object> metadata;
}
