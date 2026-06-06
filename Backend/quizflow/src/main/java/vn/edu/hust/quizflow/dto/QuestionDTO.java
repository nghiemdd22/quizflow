package vn.edu.hust.quizflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hust.quizflow.entity.QuestionType;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Đối tượng chuyển giao dữ liệu (DTO) cho Câu hỏi (Question).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {

    private Long id;

    @NotNull(message = "ID của Ngân hàng câu hỏi không được để trống")
    private Long questionBankId;

    @NotNull(message = "Loại câu hỏi không được để trống")
    private QuestionType type;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String content;

    @NotNull(message = "Dữ liệu metadata (options, đáp án) không được để trống")
    private Map<String, Object> metadata;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
