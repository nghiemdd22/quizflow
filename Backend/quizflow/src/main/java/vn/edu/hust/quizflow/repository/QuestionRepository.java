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
    List<Question> findByQuestionBankIdOrderByOrderIndexAscIdAsc(Long bankId);
    
    /**
     * Tìm giá trị orderIndex lớn nhất trong một ngân hàng câu hỏi
     */
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(q.orderIndex), 0) FROM Question q WHERE q.questionBank.id = :bankId")
    Integer findMaxOrderIndexByBankId(@org.springframework.data.repository.query.Param("bankId") Long bankId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(q) FROM Question q WHERE q.questionBank.teacher.id = :teacherId")
    long countQuestionsByTeacherId(@org.springframework.data.repository.query.Param("teacherId") Long teacherId);
}
