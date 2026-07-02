package vn.edu.hust.quizflow.dto;

import lombok.Data;
import vn.edu.hust.quizflow.entity.SessionStatus;

import java.time.LocalDateTime;

@Data
public class ExamSessionDTO {
    private Long id;
    private Long examId;
    private Long classId;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int durationMinutes;
    private SessionStatus status;
}
