package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassDocumentDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String format;
    private Long sizeBytes;
    private LocalDateTime uploadedAt;
    private String uploaderName;
}
