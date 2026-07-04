package vn.edu.hust.quizflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "class_chat_states", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "classroom_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassChatState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Column(nullable = false)
    private int unreadCount;
}
