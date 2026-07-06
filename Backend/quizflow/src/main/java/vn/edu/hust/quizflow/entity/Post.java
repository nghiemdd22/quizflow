package vn.edu.hust.quizflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private int viewsCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM comments c WHERE c.post_id = id)")
    private int commentsCount;

    @org.hibernate.annotations.Formula("(SELECT COUNT(pv.id) FROM post_votes pv WHERE pv.post_id = id AND pv.vote_type = 1)")
    private int upvotes;

    @org.hibernate.annotations.Formula("(SELECT COUNT(pv.id) FROM post_votes pv WHERE pv.post_id = id AND pv.vote_type = -1)")
    private int downvotes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
