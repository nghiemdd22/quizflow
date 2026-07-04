package vn.edu.hust.quizflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hust.quizflow.entity.ClassroomStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomResponse {
    private Long id;
    private String name;
    private String code;
    private String teacherName;
    private ClassroomStatus status;
    private LocalDateTime createdAt;
    private long memberCount;
    private int unreadMessageCount;
}
