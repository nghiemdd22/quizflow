package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.Comment;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByIsAcceptedDescCreatedAtAsc(Long postId);
    List<Comment> findByPostId(Long postId);
}
