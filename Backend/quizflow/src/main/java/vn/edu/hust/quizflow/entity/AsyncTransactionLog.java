package vn.edu.hust.quizflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "async_transaction_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsyncTransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ExamSubmission submission;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private TransactionEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionLogStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "json")
    private Map<String, Object> payload;

    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
