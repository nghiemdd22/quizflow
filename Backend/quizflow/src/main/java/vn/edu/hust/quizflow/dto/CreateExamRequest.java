package vn.edu.hust.quizflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateExamRequest {
    @NotNull(message = "Thiếu ID môn học")
    private Long subjectId;

    @NotBlank(message = "Tên đề thi không được để trống")
    private String title;

    private String description;
}
