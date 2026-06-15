package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hust.quizflow.entity.QuestionType;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionReviewDto {
    private Long questionId;
    private QuestionType type;
    private String content;
    private Map<String, Object> metadata;
    private Map<String, Object> studentAnswer;
    private Boolean isCorrect;
    private BigDecimal scoreAchieved;
}
