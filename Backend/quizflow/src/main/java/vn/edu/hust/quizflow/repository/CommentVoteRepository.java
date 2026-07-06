package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.CommentVote;

import java.util.Optional;

@Repository
public interface CommentVoteRepository extends JpaRepository<CommentVote, Long> {
    Optional<CommentVote> findByCommentIdAndUserId(Long commentId, Long userId);
}
