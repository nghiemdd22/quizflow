package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.NotificationDTO;
import vn.edu.hust.quizflow.entity.Notification;
import vn.edu.hust.quizflow.entity.NotificationType;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.NotificationRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        notificationRepository.markAllAsRead(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo"));
        if (notification.getRecipient().getUsername().equals(username)) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    /**
     * Tạo thông báo và lưu DB, đồng thời bắn Realtime
     */
    @Transactional
    public void createAndSendNotification(User recipient, String title, String message, NotificationType type, Long relatedId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        
        NotificationDTO dto = mapToDTO(notification);
        // Bắn vào kênh private của user: /user/{username}/queue/notifications
        messagingTemplate.convertAndSendToUser(recipient.getUsername(), "/queue/notifications", dto);
    }

    /**
     * Bắn thông báo Realtime mà KHÔNG lưu vào DB (dùng cho Chat)
     */
    public void sendRealtimeNotificationOnly(String recipientUsername, String title, String message, NotificationType type, Long relatedId) {
        NotificationDTO dto = NotificationDTO.builder()
                .id(System.currentTimeMillis()) // Fake ID
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/notifications", dto);
    }

    private NotificationDTO mapToDTO(Notification notif) {
        return NotificationDTO.builder()
                .id(notif.getId())
                .title(notif.getTitle())
                .message(notif.getMessage())
                .type(notif.getType())
                .relatedId(notif.getRelatedId())
                .isRead(notif.getIsRead())
                .createdAt(notif.getCreatedAt() != null ? notif.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
