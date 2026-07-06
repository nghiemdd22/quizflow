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
public class ActiveExamSessionDTO {
    private Long id;
    private String title;
    private String classroomName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int durationMinutes;
    private long currentParticipants;
}
