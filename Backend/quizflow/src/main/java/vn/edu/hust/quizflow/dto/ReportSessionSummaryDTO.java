package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSessionSummaryDTO {
    private Long id;
    private String name;
    private String date; // formatted string for display
    private int participants;
    private double avgScore;
    private int cheatAttempts;
}
