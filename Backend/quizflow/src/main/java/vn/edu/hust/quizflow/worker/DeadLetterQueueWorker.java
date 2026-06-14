package vn.edu.hust.quizflow.worker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import vn.edu.hust.quizflow.config.RabbitMQConfig;
import vn.edu.hust.quizflow.dto.message.SubmitExamMessage;
import vn.edu.hust.quizflow.entity.AsyncTransactionLog;
import vn.edu.hust.quizflow.entity.ExamSubmission;
import vn.edu.hust.quizflow.entity.TransactionEventType;
import vn.edu.hust.quizflow.entity.TransactionLogStatus;
import vn.edu.hust.quizflow.repository.AsyncTransactionLogRepository;
import vn.edu.hust.quizflow.repository.ExamSubmissionRepository;
import vn.edu.hust.quizflow.service.AsyncTransactionLogService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Worker đặc biệt đóng vai trò là "Bác sĩ cứu thương" của hệ thống SAGA.
 * Lắng nghe trên Dead Letter Queue (thùng rác an toàn) để cứu các Message bị
 * lỗi và tự động Retry chúng.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeadLetterQueueWorker {

    private final ExamSubmissionRepository submissionRepository;
    private final AsyncTransactionLogRepository logRepository;
    private final AsyncTransactionLogService logService;
    private final RabbitTemplate rabbitTemplate;

    // Cấu hình tối đa 3 lần thử lại để tránh vòng lặp vô tận (Infinite Loop)
    private static final int MAX_RETRIES = 3;

    /**
     * Lắng nghe các Message bị đẩy vào Dead Letter Queue do lỗi sập hệ thống
     * (Exception).
     * Quá trình xử lý (Auto-Retry Mechanism) diễn ra như sau:
     * 1. Tra cứu Log FAILED tương ứng của bài thi từ Database.
     * 2. Nếu số lần thử lại (retryCount) chưa vượt quá MAX_RETRIES, tăng biến đếm,
     * đổi trạng thái Log thành PENDING
     * và ném Message ngược lại Main Exchange để hệ thống tự động chấm lại (Tự chữa
     * lành).
     * 3. Nếu đã hết số lần thử, ghi nhận cờ FATAL vào Payload để cảnh báo đỏ cho
     * Admin xử lý thủ công.
     */
    @RabbitListener(queues = RabbitMQConfig.SUBMIT_EXAM_DLQ)
    public void processFailedSubmission(SubmitExamMessage message) {
        log.warn("DLQ Worker nhận được Message lỗi: SessionId={}, StudentId={}",
                message.getExamSessionId(), message.getStudentId());

        try {
            // 1. Tìm bản ghi bài thi tương ứng
            ExamSubmission submission = submissionRepository
                    .findByExamSessionIdAndStudentId(message.getExamSessionId(), message.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ExamSubmission"));

            // 2. Tra cứu nguyên nhân lỗi (vừa được ghi bởi AsyncTransactionLogService)
            Optional<AsyncTransactionLog> optionalLog = logRepository
                    .findBySubmissionIdAndEventType(submission.getId(), TransactionEventType.EXAM_GRADING);

            if (optionalLog.isEmpty()) {
                log.error("Lạ thật! Message rơi vào DLQ nhưng không tìm thấy Log? Bỏ qua Message này.");
                return;
            }

            AsyncTransactionLog logEntry = optionalLog.get();

            // 3. Quyết định: Retry hay Bỏ cuộc?
            // Nếu hệ thống mới thử lại dưới MAX_RETRIES lần, ta cho phép làm lại.
            // (Ví dụ: Lỗi do quá tải DB ngắn hạn, thử lại vài giây sau có thể sẽ thành công)
            if (logEntry.getRetryCount() < MAX_RETRIES) {

                // Tăng biến đếm và đánh dấu trở lại thành Đang xử lý
                logEntry.setRetryCount(logEntry.getRetryCount() + 1);
                logEntry.setStatus(TransactionLogStatus.PENDING);
                logService.saveLog(logEntry);

                log.info("Thực hiện Auto-Retry lần thứ {}. Gửi Message quay lại chiến trường (Main Queue)...",
                        logEntry.getRetryCount());

                // Bơm lại Message vào Luồng chấm điểm chính
                // Lưu ý: Ta dùng Routing Key chuẩn để nó chảy vào Main Queue, 
                // giống hệt như một học sinh vừa mới nộp bài bình thường.
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.SUBMIT_EXAM_EXCHANGE,
                        RabbitMQConfig.SUBMIT_EXAM_ROUTING_KEY,
                        message
                );
            } else {

                // Hết Quota! Chấp nhận thất bại hoàn toàn.
                // Log cảnh báo nghiêm trọng. Quản trị viên (Admin) sẽ cần đọc Log này 
                // và trực tiếp kiểm tra lại dữ liệu bài thi.
                log.error("FATAL: Message đã Retry {} lần nhưng vẫn thất bại! Cần Admin can thiệp thủ công. SubmissionId={}", 
                        MAX_RETRIES, submission.getId());

                // Cập nhật Payload để dán nhãn FATAL báo động đỏ
                Map<String, Object> payload = logEntry.getPayload();
                if (payload == null) {
                    payload = new HashMap<>();
                }
                payload.put("is_fatal", true);
                payload.put("fatal_reason", "Vượt quá số lần Retry cho phép (" + MAX_RETRIES + ")");
                logEntry.setPayload(payload);
                logService.saveLog(logEntry);
            }

        } catch (Exception e) {
            log.error("Lỗi nghiêm trọng khi bản thân DLQ Worker đang xử lý cứu thương!", e);
        }
    }
}
