package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.PostAttachment;

import java.util.List;

@Repository
public interface PostAttachmentRepository extends JpaRepository<PostAttachment, Long> {
    List<PostAttachment> findByPostId(Long postId);
}
