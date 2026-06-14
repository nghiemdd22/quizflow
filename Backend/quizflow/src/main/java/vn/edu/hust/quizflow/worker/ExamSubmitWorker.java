package vn.edu.hust.quizflow.worker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.edu.hust.quizflow.config.RabbitMQConfig;
import vn.edu.hust.quizflow.dto.message.SubmitExamMessage;
import vn.edu.hust.quizflow.service.SubmissionGradingService;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExamSubmitWorker {

    private final SubmissionGradingService submissionGradingService;

    /**
     * Lắng nghe liên tục trên hàng đợi submit_exam_queue.
     * Khi có một Message (chứa ID học sinh và các câu trả lời) được đẩy vào,
     * Worker sẽ tự động bốc ra và gọi qua GradingService để chấm điểm ngầm.
     */
    @RabbitListener(queues = RabbitMQConfig.SUBMIT_EXAM_QUEUE)
    public void processSubmission(SubmitExamMessage message) {
        log.info("Worker bắt đầu xử lý Message nộp bài: SessionId={}, StudentId={}",
                message.getExamSessionId(), message.getStudentId());

        // Gọi Service tiến hành chấm điểm (Có đi kèm ghi log AsyncTransaction)
        submissionGradingService.gradeSubmission(message);

        log.info("Worker xử lý thành công Message nộp bài: SessionId={}, StudentId={}",
                message.getExamSessionId(), message.getStudentId());
    }
}
