package vn.edu.hust.quizflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClassroomUpdateRequest {
    @NotBlank(message = "Tên lớp không được để trống")
    @Size(max = 255, message = "Tên lớp không vượt quá 255 ký tự")
    private String name;
}
