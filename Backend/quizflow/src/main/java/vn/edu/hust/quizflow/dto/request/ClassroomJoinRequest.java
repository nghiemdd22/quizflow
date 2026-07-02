package vn.edu.hust.quizflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClassroomJoinRequest {
    @NotBlank(message = "Mã lớp không được để trống")
    private String code;
}
