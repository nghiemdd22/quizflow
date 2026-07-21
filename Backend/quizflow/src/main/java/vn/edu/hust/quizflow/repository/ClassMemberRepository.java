package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.ClassMember;

import java.util.List;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {
    boolean existsByClassroomIdAndStudentId(Long classroomId, Long studentId);
    List<ClassMember> findByStudentId(Long studentId);
    
    @Query("SELECT cm FROM ClassMember cm JOIN FETCH cm.classroom c JOIN FETCH c.teacher WHERE cm.student.id = :studentId")
    List<ClassMember> findByStudentIdWithClassroomAndTeacher(@Param("studentId") Long studentId);

    List<ClassMember> findByClassroomId(Long classroomId);
    int countByClassroomId(Long classroomId);
    
    @Query("SELECT cm.classroom.id, COUNT(cm) FROM ClassMember cm WHERE cm.classroom.id IN :classIds GROUP BY cm.classroom.id")
    List<Object[]> countMembersByClassroomIds(@Param("classIds") List<Long> classIds);
}
