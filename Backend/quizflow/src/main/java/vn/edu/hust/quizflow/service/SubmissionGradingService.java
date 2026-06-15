package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.message.SubmitExamMessage;
import vn.edu.hust.quizflow.entity.*;
import vn.edu.hust.quizflow.repository.ExamQuestionRepository;
import vn.edu.hust.quizflow.repository.ExamSubmissionRepository;
import vn.edu.hust.quizflow.repository.StudentAnswerRepository;
import vn.edu.hust.quizflow.service.scoring.ScoringStrategy;
import vn.edu.hust.quizflow.service.scoring.ScoringStrategyFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Trái tim của hệ thống chấm điểm bất đồng bộ.
 * Service này chịu trách nhiệm nhận dữ liệu từ RabbitMQ Worker, tính toán điểm số 
 * cho từng câu trả lời, và lưu kết quả cuối cùng xuống cơ sở dữ liệu (MySQL).
 * 
 * Đặc biệt: Nó được thiết kế tuân thủ nghiêm ngặt nền tảng của SAGA Pattern bằng cách
 * luôn duy trì một Audit Log (AsyncTransactionLog) để theo dõi trạng thái thành công/thất bại,
 * làm tiền đề cho tiến trình Compensating Transaction (Bù trừ lỗi) hoạt động.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionGradingService {

    private final ExamSubmissionRepository examSubmissionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final AsyncTransactionLogService asyncTransactionLogService;
    private final ExamQuestionRepository examQuestionRepository;
    private final ScoringStrategyFactory scoringStrategyFactory;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Hàm thực thi logic chấm điểm chính.
     * <p>
     * Cực kỳ quan trọng: Sử dụng @Transactional(propagation = Propagation.REQUIRES_NEW).
     * Điều này ép Spring mở một Transaction hoàn toàn mới, độc lập với Transaction cha 
     * (nếu có). Nhờ vậy, nếu hàm này bị crash (Exception) ở bất kỳ dòng code nào, 
     * khối catch() ở bên dưới vẫn có thể an toàn lưu trạng thái FAILED vào Database 
     * mà không sợ bị cuốn theo lệnh Rollback của Transaction bên ngoài.
     *
     * @param message Payload gốc (được đóng gói từ Redis) chứa đáp án của học sinh
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void gradeSubmission(SubmitExamMessage message) {
        Long submissionId = null;
        AsyncTransactionLog logEntry = null;

        try {
            // 1. Tìm bản ghi ExamSubmission
            ExamSubmission submission = examSubmissionRepository
                    .findByExamSessionIdAndStudentId(message.getExamSessionId(), message.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ExamSubmission. SessionId=" 
                            + message.getExamSessionId() + ", StudentId=" + message.getStudentId()));
            
            submissionId = submission.getId();

            // 2. Ghi Log bắt đầu quá trình chấm điểm
            logEntry = AsyncTransactionLog.builder()
                    .submission(submission)
                    .eventType(TransactionEventType.EXAM_GRADING)
                    .status(TransactionLogStatus.PENDING)
                    .build();
            logEntry = asyncTransactionLogService.saveLog(logEntry);

            // 3. Tiến hành lấy danh sách câu hỏi của đề thi để đối chiếu chấm điểm
            List<ExamQuestion> examQuestions = examQuestionRepository.findByExamIdOrderByOrderIndexAsc(submission.getExamSession().getExam().getId());
            
            BigDecimal totalScore = BigDecimal.ZERO;
            List<StudentAnswer> studentAnswersToSave = new ArrayList<>();

            // 4. Duyệt qua từng câu hỏi và gọi ScoringStrategy tương ứng
            for (ExamQuestion eq : examQuestions) {
                Question question = eq.getQuestion();
                Object rawAnswer = message.getAnswers() != null ? message.getAnswers().get(question.getId()) : null;

                // Lấy công cụ chấm điểm phù hợp dựa trên loại câu hỏi
                ScoringStrategy strategy = scoringStrategyFactory.getStrategy(question.getType());
                
                // Mặc định trọng số mỗi câu là 1.0 điểm nếu không cấu hình (hoặc có thể cấu hình từ ExamQuestion)
                BigDecimal maxScore = BigDecimal.ONE; 
                
                // Tính điểm
                BigDecimal scoreAchieved = strategy.calculateScore(rawAnswer, question.getMetadata(), maxScore);
                totalScore = totalScore.add(scoreAchieved);

                // Xác định tính đúng/sai hoàn toàn (nếu được trọn điểm thì là đúng)
                boolean isCorrect = scoreAchieved.compareTo(maxScore) == 0;

                // Đóng gói cấu trúc lưu lại đáp án học sinh chọn vào database
                Map<String, Object> answerContent = new HashMap<>();
                if (rawAnswer != null) {
                    answerContent.put("selected", rawAnswer);
                }

                StudentAnswer studentAnswer = StudentAnswer.builder()
                        .submission(submission)
                        .question(question)
                        .answerContent(answerContent)
                        .isCorrect(isCorrect)
                        .scoreAchieved(scoreAchieved)
                        .build();

                studentAnswersToSave.add(studentAnswer);
            }

            // 5. Lưu Batch toàn bộ chi tiết câu trả lời vào DB
            studentAnswerRepository.saveAll(studentAnswersToSave);

            // 6. Cập nhật tổng điểm và trạng thái cuối cùng cho bài thi
            submission.setTotalScore(totalScore);
            submission.setStatus(SubmissionStatus.COMPLETED);
            examSubmissionRepository.save(submission);

            // 7. Cập nhật Log giao dịch thành SUCCESS
            logEntry.setStatus(TransactionLogStatus.SUCCESS);
            asyncTransactionLogService.saveLog(logEntry);

            // 8. Đẩy thông báo có điểm qua WebSocket cho Frontend
            if (message.getUsername() != null) {
                Map<String, Object> wsPayload = new HashMap<>();
                wsPayload.put("status", "SCORED");
                wsPayload.put("score", totalScore);
                messagingTemplate.convertAndSendToUser(message.getUsername(), "/queue/exam-results", wsPayload);
            }

            log.info("Đã chấm điểm xong. SubmissionId={}, TotalScore={}", submissionId, totalScore);

        } catch (Exception e) {
            log.error("Lỗi khi chấm điểm SubmissionId={}", submissionId, e);
            
            // Xử lý ghi nhận Log lỗi nếu quá trình sụp đổ
            if (logEntry != null) {
                logEntry.setStatus(TransactionLogStatus.FAILED);
                // Ghi chú chi tiết lỗi vào Payload
                Map<String, Object> payload = new HashMap<>();
                payload.put("error_message", e.getMessage());
                logEntry.setPayload(payload);
                
                // QUAN TRỌNG: Tại sao lại gọi Service thay vì Repository ở đây?
                // Vì hàm gradeSubmission này đang nằm trong @Transactional.
                // Khi lệnh "throw new RuntimeException" ở bên dưới được thực thi,
                // toàn bộ Transaction của hàm này sẽ bị Rollback (hủy bỏ).
                // Do đó, ta PHẢI gọi sang AsyncTransactionLogService (nơi có REQUIRES_NEW)
                // để nó mở một Transaction hoàn toàn độc lập, lưu cái Log FAILED này xuống DB an toàn,
                // rồi mới quay lại đây chịu trận Rollback.
                asyncTransactionLogService.saveLog(logEntry);
            }
            
            // Thông báo cho Frontend biết đã xảy ra lỗi để thoát trạng thái "Đang chấm điểm"
            if (message.getUsername() != null) {
                Map<String, Object> wsPayload = new HashMap<>();
                wsPayload.put("status", "FAILED");
                wsPayload.put("message", "Có lỗi xảy ra trong quá trình chấm điểm. Đừng lo lắng, bài làm của bạn đã được ghi nhận. Vui lòng kiểm tra lại ở mục Lịch sử sau ít phút.");
                messagingTemplate.convertAndSendToUser(message.getUsername(), "/queue/exam-results", wsPayload);
            }

            // Ném ngược lại Exception chuyên biệt để RabbitMQ biết mà đẩy vào DLQ thay vì lặp vô tận
            throw new AmqpRejectAndDontRequeueException("Lỗi trong quá trình chấm điểm, đẩy vào DLQ", e);
        }
    }
}
