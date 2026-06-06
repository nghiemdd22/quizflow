package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.Question;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    /**
     * Tìm danh sách câu hỏi thuộc về một ngân hàng câu hỏi (QuestionBank).
     * @param bankId ID của ngân hàng câu hỏi
     * @return Danh sách câu hỏi
     */
    List<Question> findByQuestionBankId(Long bankId);
}
