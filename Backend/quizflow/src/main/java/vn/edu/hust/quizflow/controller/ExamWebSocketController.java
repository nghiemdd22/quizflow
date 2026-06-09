package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import vn.edu.hust.quizflow.dto.StudentAnswerRequest;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.UserRepository;
import vn.edu.hust.quizflow.service.RedisService;

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
        
        // Lưu câu trả lời của học sinh vào bộ đệm Redis
        // Việc dùng Redis giúp hệ thống có thể xử lý lượng lớn câu trả lời cùng lúc một cách cực kỳ nhanh chóng 
        // mà không gây quá tải cho cơ sở dữ liệu chính (MySQL).
        redisService.saveAnswer(request.getSessionId(), student.getId(), request.getQuestionId(), request.getAnswerData());
    }
}
