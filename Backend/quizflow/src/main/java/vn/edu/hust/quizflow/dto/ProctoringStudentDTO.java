package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProctoringStudentDTO {
    private String studentName;
    private String username;
    private LocalDateTime startedAt;
    private int cheatCount;
    private List<CheatEventDTO> cheatEvents;
}
