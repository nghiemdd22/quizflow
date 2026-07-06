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
public class RecentHistoryDTO {
    private Long id;
    private String name;
    private LocalDateTime date;
    private int participants;
    private double avgScore;
}
