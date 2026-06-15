package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hust.quizflow.entity.SubmissionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamHistoryResponse {
    private Long id;
    private String examTitle;
    private String subjectName;
    private BigDecimal score;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private SubmissionStatus status;
}
