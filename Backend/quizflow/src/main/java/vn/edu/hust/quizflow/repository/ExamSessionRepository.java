package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.ExamSession;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {
    List<ExamSession> findByExamIdOrderByStartTimeDesc(Long examId);
    List<ExamSession> findByClassroomIdOrderByStartTimeDesc(Long classroomId);
    List<ExamSession> findAllByStatusAndEndTimeBefore(vn.edu.hust.quizflow.entity.SessionStatus status, java.time.LocalDateTime endTime);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(es) FROM ExamSession es WHERE es.exam.teacher.id = :teacherId")
    long countByExamTeacherId(@org.springframework.data.repository.query.Param("teacherId") Long teacherId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(es) FROM ExamSession es WHERE es.exam.teacher.id = :teacherId AND es.status = :status")
    long countByExamTeacherIdAndStatus(@org.springframework.data.repository.query.Param("teacherId") Long teacherId, @org.springframework.data.repository.query.Param("status") vn.edu.hust.quizflow.entity.SessionStatus status);

    List<ExamSession> findByExamTeacherIdAndStatusOrderByStartTimeDesc(Long teacherId, vn.edu.hust.quizflow.entity.SessionStatus status);

    List<ExamSession> findTop5ByExamTeacherIdAndStatusOrderByEndTimeDesc(Long teacherId, vn.edu.hust.quizflow.entity.SessionStatus status);
}
