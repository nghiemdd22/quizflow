package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hust.quizflow.entity.ExamSubmission;

import java.util.List;
import java.util.Optional;

public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    Optional<ExamSubmission> findByExamSessionIdAndStudentId(Long sessionId, Long studentId);

    List<ExamSubmission> findByExamSessionIdAndStatus(Long sessionId,
            vn.edu.hust.quizflow.entity.SubmissionStatus status);

    List<ExamSubmission> findByExamSessionId(Long sessionId);

    List<ExamSubmission> findByStudentIdOrderByStartedAtDesc(Long studentId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(es) FROM ExamSubmission es WHERE es.examSession.exam.teacher.id = :teacherId")
    long countParticipantsByTeacherId(@org.springframework.data.repository.query.Param("teacherId") Long teacherId);
}
