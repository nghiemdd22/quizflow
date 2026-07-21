package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.Classroom;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    Optional<Classroom> findByCode(String code);
    List<Classroom> findByTeacherId(Long teacherId);
    
    @Query("SELECT c FROM Classroom c JOIN FETCH c.teacher WHERE c.teacher.id = :teacherId")
    List<Classroom> findByTeacherIdWithTeacher(@Param("teacherId") Long teacherId);
    
    boolean existsByCode(String code);
}
