package vn.edu.hust.quizflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Đối tượng chuyển giao dữ liệu (DTO) cho Ngân hàng câu hỏi (QuestionBank).
 * Dùng để nhận dữ liệu từ request tạo/sửa hoặc trả về thông tin chi tiết cho client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBankDTO {

    // ID của ngân hàng câu hỏi (null khi tạo mới)
    private Long id;

    // Tiêu đề của ngân hàng câu hỏi, bắt buộc nhập
    @NotBlank(message = "Tiêu đề ngân hàng câu hỏi không được để trống")
    @Size(max = 255, message = "Tiêu đề ngân hàng câu hỏi không được vượt quá 255 ký tự")
    private String title;

    // Mô tả chi tiết ngân hàng câu hỏi (tùy chọn)
    private String description;

    // ID của môn học liên kết với ngân hàng câu hỏi này
    @NotNull(message = "ID môn học không được để trống")
    private Long subjectId;

    // ID của giáo viên sở hữu ngân hàng câu hỏi này (chỉ trả về hoặc lấy từ phiên đăng nhập)
    private Long teacherId;

    // Họ tên của giáo viên sở hữu (tiện lợi hiển thị ở frontend)
    private String teacherName;

    // Thời gian tạo ngân hàng câu hỏi
    private LocalDateTime createdAt;
}
