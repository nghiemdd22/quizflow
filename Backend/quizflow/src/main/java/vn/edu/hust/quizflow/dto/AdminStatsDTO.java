package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalStudents;
    private long totalTeachers;
    private long totalQuestionBanks;
    private long totalSessions;
    private long activeSessions;
}
