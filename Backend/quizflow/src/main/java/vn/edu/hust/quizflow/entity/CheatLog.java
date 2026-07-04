package vn.edu.hust.quizflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cheat_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheatLog {

    /** Khóa chính tự tăng của bảng nhật ký gian lận */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Bài thi cụ thể của học sinh bị gắn cờ vi phạm (Khóa ngoại liên kết với bảng exam_submissions) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ExamSubmission examSubmission;

    /** Chi tiết mô tả hành vi gian lận (VD: "Chuyển tab", "Thu nhỏ trình duyệt") */
    @Column(name = "violation_detail", nullable = false, length = 500)
    private String violationDetail;

    /** Thời điểm chính xác xảy ra hành vi gian lận (Hệ thống tự động ghi nhận) */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
