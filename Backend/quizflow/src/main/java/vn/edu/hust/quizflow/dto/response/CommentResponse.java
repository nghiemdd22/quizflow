package vn.edu.hust.quizflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private boolean isAccepted;
    private int upvoteCount;
    private int downvoteCount;
    private LocalDateTime createdAt;
    private Integer currentUserVote; // 1 (up), -1 (down), 0 (none)
}
