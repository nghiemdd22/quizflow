package vn.edu.hust.quizflow.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionId implements Serializable {
    private Long examId;
    private Long questionId;
}
