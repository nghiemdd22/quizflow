package vn.edu.hust.quizflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Đối tượng chuyển giao dữ liệu (DTO) cho thông tin Môn học (Subject).
 * Sử dụng để gửi nhận dữ liệu giữa Client và Server khi thực hiện các thao tác CRUD.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDTO {

    // Định danh duy nhất của môn học (null khi tạo mới)
    private Long id;

    // Mã môn học (ví dụ: IT3180), bắt buộc phải có và không trùng lặp
    @NotBlank(message = "Mã môn học không được để trống")
    @Size(max = 50, message = "Mã môn học không được vượt quá 50 ký tự")
    private String code;

    // Tên môn học (ví dụ: Nhập môn Công nghệ thông tin), bắt buộc phải có
    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 255, message = "Tên môn học không được vượt quá 255 ký tự")
    private String name;

    // Mô tả chi tiết về môn học (tùy chọn)
    private String description;
}
