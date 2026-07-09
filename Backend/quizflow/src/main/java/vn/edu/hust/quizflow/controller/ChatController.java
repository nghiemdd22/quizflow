package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.ChatMessageDTO;
import vn.edu.hust.quizflow.dto.request.ChatMessageRequest;
import vn.edu.hust.quizflow.service.ChatService;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // HTTP Endpoint: Lấy lịch sử chat
    @GetMapping("/api/v1/classes/{classId}/chat/history")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @PathVariable Long classId,
            Principal principal) {
        return ResponseEntity.ok(chatService.getChatHistory(classId, principal.getName()));
    }

    // STOMP Endpoint: Nhận tin nhắn chat từ STOMP client gửi tới /app/chat/{classId}
    @MessageMapping("/chat/{classId}")
    @SendTo("/topic/class-{classId}")
    public ChatMessageDTO sendMessage(
            @DestinationVariable Long classId,
            @Payload ChatMessageRequest request,
            Principal principal) {
        
        // Lưu tin nhắn vào DB và trả về DTO
        // Lưu ý: Principal ở đây là đối tượng được inject từ JwtAuthenticationToken lúc kết nối STOMP
        return chatService.saveMessage(classId, request, principal.getName());
    }
}
