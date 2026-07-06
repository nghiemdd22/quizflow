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
public class ReportSessionDetailDTO {
    private Long id;
    private String name;
    private String date;
    private int participants;
    private double avgScore;
    private int cheatAttempts;
    
    private String className;
    private int classSize;
    private String teacherName;
    
    private List<ScoreDistributionDTO> scoreDistribution;
    private List<ScoreboardEntryDTO> scoreboard;
    private List<CheatLogDTO> cheatLogs;
}
