package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreboardEntryDTO {
    private int rank;
    private String name;
    private String startedAt; // format HH:mm:ss
    private String submittedAt; // format HH:mm:ss
    private String timeTaken; // format MM:SS
    private double score;
    private String cheatFlag; // NONE, WARNING, CRITICAL
    private String avatarUrl;
    private String userId;
}
