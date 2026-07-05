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
public class ProctoringDashboardDTO {
    private String examTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int durationMinutes;
    
    private int totalStudentsInClass;
    private int studentsInProgress;
    private int studentsSubmitted;
    private int studentsNotStarted;
    
    private List<ProctoringStudentDTO> students;
}
