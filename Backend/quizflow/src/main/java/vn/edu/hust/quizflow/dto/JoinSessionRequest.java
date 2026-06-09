package vn.edu.hust.quizflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinSessionRequest {
    @NotBlank(message = "Mã PIN không được để trống")
    private String pinCode;
}
