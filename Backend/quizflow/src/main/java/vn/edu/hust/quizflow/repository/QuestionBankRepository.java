package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.QuestionBank;

import java.util.List;

/**
 * Giao diện Repository để thực hiện các thao tác dữ liệu với bảng 'question_banks' (Ngân hàng câu hỏi).
 */
@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {

    /**
     * Tìm danh sách các ngân hàng câu hỏi do một giáo viên cụ thể tạo ra.
     *
     * @param teacherId ID của giáo viên sở hữu
     * @return Danh sách các ngân hàng câu hỏi của giáo viên đó
     */
    List<QuestionBank> findByTeacherId(Long teacherId);

    /**
     * Tìm danh sách các ngân hàng câu hỏi thuộc về một môn học cụ thể.
     *
     * @param subjectId ID của môn học
     * @return Danh sách các ngân hàng câu hỏi thuộc môn học đó
     */
    List<QuestionBank> findBySubjectId(Long subjectId);
}
