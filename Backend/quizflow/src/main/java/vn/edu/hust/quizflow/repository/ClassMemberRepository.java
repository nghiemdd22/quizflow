package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.ClassMember;

import java.util.List;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {
    boolean existsByClassroomIdAndStudentId(Long classroomId, Long studentId);
    List<ClassMember> findByStudentId(Long studentId);
    List<ClassMember> findByClassroomId(Long classroomId);
    int countByClassroomId(Long classroomId);
}
