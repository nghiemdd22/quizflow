package vn.edu.hust.quizflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateExamSessionRequest {
    @NotBlank(message = "Tên ca thi không được để trống")
    private String title;

    @NotNull(message = "Lớp học không được để trống")
    private Long classId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;

    @NotNull(message = "Thời lượng không được để trống")
    private Integer durationMinutes;
}
