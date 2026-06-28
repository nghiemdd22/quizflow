package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import vn.edu.hust.quizflow.dto.StudentAnswerRequest;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.UserRepository;
import vn.edu.hust.quizflow.service.RedisService;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import vn.edu.hust.quizflow.dto.message.AnswerAckMessage;

import java.security.Principal;

/**
 * Controller xử lý các luồng thông điệp qua WebSocket (sử dụng giao thức STOMP).
 * @Controller đánh dấu đây là một Spring Controller. Trong ngữ cảnh WebSocket, nó sẽ xử lý các request STOMP thay vì HTTP thông thường.
 */
@Controller
@RequiredArgsConstructor
public class ExamWebSocketController {

    private final RedisService redisService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Phương thức xử lý khi có client (học sinh) nộp câu trả lời lên server.
     * @MessageMapping("/submit-answer") có nghĩa là hàm này sẽ đón các thông điệp gửi tới đường dẫn "/app/submit-answer"
     * (Vì tiền tố "/app" đã được thiết lập sẵn trong lớp WebSocketConfig).
     *
     * @param request Payload (dữ liệu gửi lên từ frontend) chứa thông tin sessionId, questionId và nội dung câu trả lời.
     * @param principal Đối tượng bảo mật chứa thông tin User đang mở kết nối này 
     *                  (Thông tin này đã được ChannelInterceptor trong WebSocketConfig trích xuất từ JWT Token).
     */
    @MessageMapping("/submit-answer")
    public void submitAnswer(StudentAnswerRequest request, Principal principal) {
        // Kiểm tra xem người dùng đã được xác thực chưa. Nếu null tức là request không có token hoặc token bị lỗi.
        if (principal == null) return;
        
        // Lấy thông tin học sinh từ cơ sở dữ liệu dựa trên username lấy được từ đối tượng principal
        User student = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));
        
        try {
            // Lưu câu trả lời của học sinh vào bộ đệm Redis
            redisService.saveAnswer(request.getSessionId(), student.getId(), request.getQuestionId(), request.getAnswerData());

            // Bắn gói tin xác nhận (ACK) về cho riêng học sinh này để UI chuyển màu từ Xanh dương (Pending) sang Xanh lá (Synced)
            AnswerAckMessage ackMessage = new AnswerAckMessage(request.getQuestionId(), "SYNCED");
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/answer-ack", ackMessage);
        } catch (Exception e) {
            // Nếu Redis sập hoặc xảy ra lỗi ngầm, bắn gói tin báo FAILED về để UI chuyển sang màu Đỏ (Red)
            AnswerAckMessage errMessage = new AnswerAckMessage(request.getQuestionId(), "FAILED");
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/answer-ack", errMessage);
        }
    }
}
