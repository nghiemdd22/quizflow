package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hust.quizflow.dto.*;
import vn.edu.hust.quizflow.entity.CheatLog;
import vn.edu.hust.quizflow.entity.ExamSession;
import vn.edu.hust.quizflow.entity.ExamSubmission;
import vn.edu.hust.quizflow.entity.SessionStatus;
import vn.edu.hust.quizflow.repository.CheatLogRepository;
import vn.edu.hust.quizflow.repository.ExamSessionRepository;
import vn.edu.hust.quizflow.repository.ExamSubmissionRepository;
import vn.edu.hust.quizflow.repository.ClassMemberRepository;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ExamSessionRepository examSessionRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final CheatLogRepository cheatLogRepository;
    private final ClassMemberRepository classMemberRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public List<ReportSessionSummaryDTO> getClosedSessionsForTeacher(Long teacherId) {
        List<ExamSession> closedSessions = examSessionRepository.findByExamTeacherIdAndStatusOrderByStartTimeDesc(teacherId, SessionStatus.CLOSED);
        return closedSessions.stream().map(session -> {
            List<ExamSubmission> subs = examSubmissionRepository.findByExamSessionId(session.getId());
            double sum = 0;
            int cheatAttempts = 0;
            for (ExamSubmission sub : subs) {
                sum += sub.getTotalScore() != null ? sub.getTotalScore().doubleValue() : 0.0;
                cheatAttempts += sub.getCheatCount();
            }
            double avg = subs.isEmpty() ? 0 : Math.round((sum / subs.size()) * 10.0) / 10.0;
            return ReportSessionSummaryDTO.builder()
                    .id(session.getId())
                    .name(session.getTitle())
                    .date(session.getStartTime() != null ? session.getStartTime().format(DATE_FORMAT) : "")
                    .participants(subs.size())
                    .avgScore(avg)
                    .cheatAttempts(cheatAttempts)
                    .build();
        }).collect(Collectors.toList());
    }

    public ReportSessionDetailDTO getSessionDetail(Long sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId).orElseThrow();
        List<ExamSubmission> subs = examSubmissionRepository.findByExamSessionId(sessionId);
        
        double sum = 0;
        int cheatAttempts = 0;
        int[] ranges = new int[4]; // 0-4, 4-6, 6-8, 8-10

        List<ScoreboardEntryDTO> scoreboard = new ArrayList<>();
        
        for (ExamSubmission sub : subs) {
            double score = sub.getTotalScore() != null ? sub.getTotalScore().doubleValue() : 0.0;
            sum += score;
            cheatAttempts += sub.getCheatCount();
            
            if (score < 4) ranges[0]++;
            else if (score < 6) ranges[1]++;
            else if (score < 8) ranges[2]++;
            else ranges[3]++;
            
            String timeTaken = "--:--";
            String startStr = "--:--:--";
            String submitStr = "--:--:--";
            
            if (sub.getStartedAt() != null) {
                startStr = sub.getStartedAt().format(TIME_FORMAT);
            }
            
            if (sub.getSubmittedAt() != null) {
                submitStr = sub.getSubmittedAt().format(TIME_FORMAT);
            }
            
            if (sub.getStartedAt() != null && sub.getSubmittedAt() != null) {
                Duration d = Duration.between(sub.getStartedAt(), sub.getSubmittedAt());
                long mm = d.toMinutes();
                long ss = d.toSecondsPart();
                timeTaken = String.format("%02d:%02d", mm, ss);
            } else if (sub.getStartedAt() != null) {
                // If they never submitted, time taken is the duration from start to session end
                Duration d = Duration.between(sub.getStartedAt(), session.getEndTime());
                if (!d.isNegative()) {
                    long mm = d.toMinutes();
                    long ss = d.toSecondsPart();
                    timeTaken = String.format("%02d:%02d", mm, ss);
                }
            }
            
            String flag = "NONE";
            if (sub.getCheatCount() > 1) flag = "CRITICAL";
            else if (sub.getCheatCount() == 1) flag = "WARNING";
            
            scoreboard.add(ScoreboardEntryDTO.builder()
                .name(sub.getStudent().getFullName())
                .score(score)
                .startedAt(startStr)
                .submittedAt(submitStr)
                .timeTaken(timeTaken)
                .cheatFlag(flag)
                .build());
        }
        
        // Sort scoreboard by score descending
        scoreboard.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        for (int i = 0; i < scoreboard.size(); i++) {
            scoreboard.get(i).setRank(i + 1);
        }

        double avg = subs.isEmpty() ? 0 : Math.round((sum / subs.size()) * 10.0) / 10.0;

        List<ScoreDistributionDTO> dist = List.of(
            new ScoreDistributionDTO("0-4", ranges[0]),
            new ScoreDistributionDTO("4-6", ranges[1]),
            new ScoreDistributionDTO("6-8", ranges[2]),
            new ScoreDistributionDTO("8-10", ranges[3])
        );

        List<CheatLog> rawLogs = cheatLogRepository.findByExamSubmission_ExamSession_IdOrderByCreatedAtDesc(sessionId);
        List<CheatLogDTO> cheatLogs = rawLogs.stream().map(log -> {
            int studentCheatCount = log.getExamSubmission().getCheatCount();
            return CheatLogDTO.builder()
                .student(log.getExamSubmission().getStudent().getFullName())
                .time(log.getCreatedAt() != null ? log.getCreatedAt().format(TIME_FORMAT) : "")
                .event(log.getViolationDetail())
                .severity(studentCheatCount > 1 ? "CRITICAL" : "WARNING")
                .build();
        }).collect(Collectors.toList());

        return ReportSessionDetailDTO.builder()
                .id(session.getId())
                .name(session.getTitle())
                .date(session.getStartTime() != null ? session.getStartTime().format(DATE_FORMAT) : "")
                .participants(subs.size())
                .avgScore(avg)
                .cheatAttempts(cheatAttempts)
                .className(session.getClassroom().getName())
                .classSize(classMemberRepository.countByClassroomId(session.getClassroom().getId()))
                .teacherName(session.getClassroom().getTeacher().getFullName())
                .scoreDistribution(dist)
                .scoreboard(scoreboard)
                .cheatLogs(cheatLogs)
                .build();
    }
}
