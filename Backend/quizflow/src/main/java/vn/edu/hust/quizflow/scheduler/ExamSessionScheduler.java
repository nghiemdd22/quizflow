package vn.edu.hust.quizflow.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.entity.ExamSession;
import vn.edu.hust.quizflow.entity.SessionStatus;
import vn.edu.hust.quizflow.repository.ExamSessionRepository;
import vn.edu.hust.quizflow.service.ExamSessionService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tiến trình chạy ngầm (CronJob) để tự động quản lý vòng đời của ca thi.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExamSessionScheduler {

    private final ExamSessionRepository examSessionRepository;
    private final ExamSessionService examSessionService;

    /**
     * Tự động quét và đóng các ca thi đã hết giờ.
     * Chạy vào giây thứ 0 của mỗi phút (Ví dụ: 10:01:00, 10:02:00, ...).
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void closeExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Bắt đầu chạy tiến trình quét các ca thi hết hạn tại thời điểm {}", now);

        // Tìm tất cả các ca thi đang diễn ra (ACTIVE) nhưng thời gian kết thúc đã qua (endTime < now)
        List<ExamSession> expiredSessions = examSessionRepository.findAllByStatusAndEndTimeBefore(SessionStatus.ACTIVE, now);

        // Nếu không có ca thi nào hết hạn, kết thúc tiến trình để tiết kiệm tài nguyên
        if (expiredSessions.isEmpty()) {
            return;
        }

        // Duyệt qua từng ca thi hết hạn để cập nhật trạng thái
        for (ExamSession session : expiredSessions) {
            session.setStatus(SessionStatus.CLOSED);
            log.info("Đã tự động đóng Ca thi có ID: {} và Mã PIN: {}", session.getId(), session.getPinCode());
            
            // Quan trọng! Quét Redis lấy đáp án của tất cả học sinh chưa nộp bài trong phòng này và đẩy vào RabbitMQ để ép thu bài tự động.
            examSessionService.forceSubmitAllPendingSubmissions(session.getId());
        }

        // Lưu đồng loạt toàn bộ trạng thái các ca thi đã đóng vào cơ sở dữ liệu (Batch Update)
        examSessionRepository.saveAll(expiredSessions);
        log.info("Đã đóng thành công tổng cộng {} ca thi hết hạn.", expiredSessions.size());
    }
}
