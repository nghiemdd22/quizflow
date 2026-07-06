package vn.edu.hust.quizflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class CreatePostRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotEmpty(message = "Phải chọn ít nhất 1 thẻ")
    private List<Long> tagIds;
    
    // File đính kèm sẽ được gửi dạng multipart/form-data cùng request
    private List<MultipartFile> files;
}
