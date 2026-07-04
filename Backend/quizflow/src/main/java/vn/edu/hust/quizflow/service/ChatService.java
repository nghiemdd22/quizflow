package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.ChatMessageDTO;
import vn.edu.hust.quizflow.dto.request.ChatMessageRequest;
import vn.edu.hust.quizflow.entity.ChatMessage;
import vn.edu.hust.quizflow.entity.Classroom;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.entity.NotificationType;
import vn.edu.hust.quizflow.entity.ClassMember;
import vn.edu.hust.quizflow.repository.ClassMemberRepository;
import vn.edu.hust.quizflow.repository.ClassroomRepository;
import vn.edu.hust.quizflow.repository.ChatMessageRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final vn.edu.hust.quizflow.repository.ClassChatStateRepository classChatStateRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public List<ChatMessageDTO> getChatHistory(Long classId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));

        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));

        checkAccess(classroom, user);

        // Lấy 50 tin nhắn gần nhất
        List<ChatMessage> messages = chatMessageRepository.findByClassroomIdOrderByCreatedAtDesc(classId, PageRequest.of(0, 50));
        
        // Đảo ngược lại để tin cũ xếp trên, tin mới xếp dưới (như chat app thông thường)
        Collections.reverse(messages);
        
        // Reset unread_count vì đã mở chat
        classChatStateRepository.resetUnreadCount(classId, user.getId());

        return messages.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDTO saveMessage(Long classId, ChatMessageRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));

        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));

        checkAccess(classroom, user);

        ChatMessage chatMessage = ChatMessage.builder()
                .content(request.getContent())
                .classroom(classroom)
                .sender(user)
                .createdAt(LocalDateTime.now()) // Gán tạm thời gian ở mức code trước khi DB trigger
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);
        
        // Cập nhật biến đếm unread_count cho giáo viên
        if (!user.getId().equals(classroom.getTeacher().getId())) {
            incrementUnreadCountAndNotify(classroom, classroom.getTeacher());
        }

        // Cập nhật biến đếm unread_count cho học sinh
        List<ClassMember> members = classMemberRepository.findByClassroomId(classroom.getId());
        for (ClassMember member : members) {
            if (!member.getStudent().getId().equals(user.getId())) {
                incrementUnreadCountAndNotify(classroom, member.getStudent());
            }
        }

        return mapToDTO(chatMessage);
    }

    private void incrementUnreadCountAndNotify(Classroom classroom, User recipient) {
        vn.edu.hust.quizflow.entity.ClassChatState state = classChatStateRepository.findByUserIdAndClassroomId(recipient.getId(), classroom.getId())
                .orElseGet(() -> vn.edu.hust.quizflow.entity.ClassChatState.builder()
                        .user(recipient)
                        .classroom(classroom)
                        .unreadCount(0)
                        .build());
        
        state.setUnreadCount(state.getUnreadCount() + 1);
        classChatStateRepository.save(state);

        // Gửi Realtime payload nhỏ để Frontend tự cập nhật số đếm
        // (Dùng NotificationDTO giả định để tái sử dụng kênh STOMP hiện tại)
        vn.edu.hust.quizflow.dto.NotificationDTO dto = vn.edu.hust.quizflow.dto.NotificationDTO.builder()
                .title("CHAT_BADGE_UPDATE")
                .message(String.valueOf(state.getUnreadCount())) // payload là số tin nhắn chưa đọc
                .type(vn.edu.hust.quizflow.entity.NotificationType.CHAT_BADGE_UPDATE)
                .relatedId(classroom.getId())
                .isRead(false)
                .build();
                
        messagingTemplate.convertAndSendToUser(recipient.getUsername(), "/queue/notifications", dto);
    }

    private void checkAccess(Classroom classroom, User user) {
        if (user.getRole() == vn.edu.hust.quizflow.entity.UserRole.TEACHER) {
            if (!classroom.getTeacher().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Bạn không có quyền truy cập lớp học này");
            }
        } else {
            boolean isMember = classMemberRepository.existsByClassroomIdAndStudentId(classroom.getId(), user.getId());
            if (!isMember) {
                throw new IllegalArgumentException("Bạn không thuộc lớp học này");
            }
        }
    }

    private ChatMessageDTO mapToDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName() != null ? message.getSender().getFullName() : message.getSender().getUsername())
                .senderRole(message.getSender().getRole().name())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
