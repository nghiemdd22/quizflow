package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardStatsDTO {
    private long totalQuestions;
    private long totalSessions;
    private long activeSessions;
    private long totalParticipants;
    private List<ActiveExamSessionDTO> activeSessionsList;
    private List<RecentHistoryDTO> recentHistoryList;
}
