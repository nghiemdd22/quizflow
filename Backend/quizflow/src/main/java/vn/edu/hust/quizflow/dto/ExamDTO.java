package vn.edu.hust.quizflow.dto;

import lombok.Data;
import vn.edu.hust.quizflow.entity.ExamStatus;

import java.time.LocalDateTime;

@Data
public class ExamDTO {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private String title;
    private String description;
    private ExamStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
