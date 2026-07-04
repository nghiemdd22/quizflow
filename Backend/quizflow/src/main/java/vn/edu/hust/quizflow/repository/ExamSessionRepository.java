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
}
