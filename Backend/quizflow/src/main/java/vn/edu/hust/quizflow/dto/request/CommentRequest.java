package vn.edu.hust.quizflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;
}
