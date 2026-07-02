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

    @Transactional(readOnly = true)
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
        
        return mapToDTO(chatMessage);
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
