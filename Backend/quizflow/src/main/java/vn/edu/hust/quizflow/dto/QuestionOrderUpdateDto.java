package vn.edu.hust.quizflow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOrderUpdateDto {
    @NotNull
    private Long id;
    
    @NotNull
    private Integer orderIndex;
}
