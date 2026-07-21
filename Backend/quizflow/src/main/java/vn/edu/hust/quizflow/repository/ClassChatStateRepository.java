package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.ClassChatState;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassChatStateRepository extends JpaRepository<ClassChatState, Long> {

    Optional<ClassChatState> findByUserIdAndClassroomId(Long userId, Long classroomId);
    
    List<ClassChatState> findByUserIdAndClassroomIdIn(Long userId, java.util.List<Long> classroomIds);

    @Modifying
    @Query("UPDATE ClassChatState c SET c.unreadCount = c.unreadCount + 1 WHERE c.classroom.id = :classroomId AND c.user.id != :senderId")
    void incrementUnreadCountForClassroomExceptSender(@Param("classroomId") Long classroomId, @Param("senderId") Long senderId);

    @Modifying
    @Query("UPDATE ClassChatState c SET c.unreadCount = 0 WHERE c.classroom.id = :classroomId AND c.user.id = :userId")
    void resetUnreadCount(@Param("classroomId") Long classroomId, @Param("userId") Long userId);
}
