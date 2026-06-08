package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.ExamQuestion;
import vn.edu.hust.quizflow.entity.ExamQuestionId;

import java.util.List;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, ExamQuestionId> {
    List<ExamQuestion> findByExamIdOrderByOrderIndexAsc(Long examId);
}
