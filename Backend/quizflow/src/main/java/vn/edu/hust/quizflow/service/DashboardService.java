package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hust.quizflow.dto.TeacherDashboardStatsDTO;
import vn.edu.hust.quizflow.entity.SessionStatus;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.ExamSessionRepository;
import vn.edu.hust.quizflow.repository.ExamSubmissionRepository;
import vn.edu.hust.quizflow.repository.QuestionRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import vn.edu.hust.quizflow.dto.ActiveExamSessionDTO;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final QuestionRepository questionRepository;
    private final ExamSessionRepository examSessionRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final UserRepository userRepository;

    public TeacherDashboardStatsDTO getTeacherDashboardStats(String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        Long teacherId = teacher.getId();

        long totalQuestions = questionRepository.countQuestionsByTeacherId(teacherId);
        long totalSessions = examSessionRepository.countByExamTeacherId(teacherId);
        long activeSessions = examSessionRepository.countByExamTeacherIdAndStatus(teacherId, SessionStatus.ACTIVE);
        long totalParticipants = examSubmissionRepository.countParticipantsByTeacherId(teacherId);

        List<ActiveExamSessionDTO> activeSessionsList = examSessionRepository
                .findByExamTeacherIdAndStatusOrderByStartTimeDesc(teacherId, SessionStatus.ACTIVE)
                .stream()
                .map(session -> {
                    long participants = examSubmissionRepository.findByExamSessionId(session.getId()).size();
                    return ActiveExamSessionDTO.builder()
                            .id(session.getId())
                            .title(session.getTitle())
                            .classroomName(session.getClassroom().getName())
                            .startTime(session.getStartTime())
                            .endTime(session.getEndTime())
                            .durationMinutes(session.getDurationMinutes())
                            .currentParticipants(participants)
                            .build();
                })
                .collect(Collectors.toList());

        List<vn.edu.hust.quizflow.dto.RecentHistoryDTO> recentHistoryList = examSessionRepository
                .findTop5ByExamTeacherIdAndStatusOrderByEndTimeDesc(teacherId, SessionStatus.CLOSED)
                .stream()
                .map(session -> {
                    List<vn.edu.hust.quizflow.entity.ExamSubmission> submissions = examSubmissionRepository.findByExamSessionId(session.getId());
                    double avgScore = submissions.stream()
                            .filter(s -> s.getTotalScore() != null)
                            .mapToDouble(s -> s.getTotalScore().doubleValue())
                            .average()
                            .orElse(0.0);

                    // Round to 1 decimal place
                    avgScore = Math.round(avgScore * 10.0) / 10.0;

                    return vn.edu.hust.quizflow.dto.RecentHistoryDTO.builder()
                            .id(session.getId())
                            .name(session.getTitle())
                            .date(session.getEndTime())
                            .participants(submissions.size())
                            .avgScore(avgScore)
                            .build();
                })
                .collect(Collectors.toList());

        return TeacherDashboardStatsDTO.builder()
                .totalQuestions(totalQuestions)
                .totalSessions(totalSessions)
                .activeSessions(activeSessions)
                .totalParticipants(totalParticipants)
                .activeSessionsList(activeSessionsList)
                .recentHistoryList(recentHistoryList)
                .build();
    }
}
