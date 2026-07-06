package vn.edu.hust.quizflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequest {
    @Min(-1)
    @Max(1)
    private int voteType; // 1: upvote, -1: downvote, 0: remove vote
}
