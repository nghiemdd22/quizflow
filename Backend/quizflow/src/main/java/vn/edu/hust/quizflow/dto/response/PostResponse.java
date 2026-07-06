package vn.edu.hust.quizflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private Long authorId;
    private int viewsCount;
    private LocalDateTime createdAt;
    private List<TagResponse> tags;
    private List<PostAttachmentResponse> attachments;
    private int upvotes;
    private int downvotes;
    private int commentsCount;
}
