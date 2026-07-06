package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.PostView;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}
