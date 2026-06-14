package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hust.quizflow.entity.StudentAnswer;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
}
