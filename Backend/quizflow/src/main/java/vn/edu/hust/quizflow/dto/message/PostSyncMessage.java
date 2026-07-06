package vn.edu.hust.quizflow.dto.message;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostSyncMessage {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private List<String> tags;
    private long timestamp;
}
