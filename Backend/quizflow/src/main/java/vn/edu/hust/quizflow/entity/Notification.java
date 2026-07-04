package vn.edu.hust.quizflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    /** Khóa chính tự tăng của bảng thông báo */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Người nhận thông báo (Liên kết với bảng users qua khóa ngoại recipient_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /** Tiêu đề ngắn gọn của thông báo */
    @Column(nullable = false)
    private String title;

    /** Nội dung chi tiết của thông báo */
    @Column(nullable = false, length = 1000)
    private String message;

    /** Loại thông báo (Dùng để Frontend biết cách xử lý và hiển thị icon tương ứng) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    /** ID của đối tượng liên quan (VD: ID lớp học, ID ca thi...) để Frontend click vào sẽ chuyển hướng đến đúng trang đó */
    private Long relatedId;

    /** Trạng thái đọc của thông báo (false: chưa đọc, true: đã đọc) */
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    /** Thời gian hệ thống tự động tạo thông báo */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
