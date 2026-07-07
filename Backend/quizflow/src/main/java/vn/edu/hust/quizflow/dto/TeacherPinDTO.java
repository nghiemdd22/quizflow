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
public class TeacherPinDTO {
    private Long id;
    private String pinCode;
    private boolean isUsed;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime usedAt;
    private String usedByUsername;
    private String createdByUsername;
}
