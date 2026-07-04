package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.CheatLog;

import java.util.List;

@Repository
public interface CheatLogRepository extends JpaRepository<CheatLog, Long> {
    List<CheatLog> findByExamSubmission_ExamSession_IdOrderByCreatedAtDesc(Long sessionId);
}
