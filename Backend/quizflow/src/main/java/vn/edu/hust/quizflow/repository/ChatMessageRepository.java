package vn.edu.hust.quizflow.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.ChatMessage;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Lấy danh sách tin nhắn của một lớp, sắp xếp theo thời gian tăng dần
    List<ChatMessage> findByClassroomIdOrderByCreatedAtAsc(Long classroomId);
    
    // Tùy chọn: Lấy N tin nhắn gần nhất (dùng Pageable để limit)
    List<ChatMessage> findByClassroomIdOrderByCreatedAtDesc(Long classroomId, Pageable pageable);
}
