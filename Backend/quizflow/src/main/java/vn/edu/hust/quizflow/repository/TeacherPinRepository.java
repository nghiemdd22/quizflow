package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.TeacherPin;

import java.util.Optional;

@Repository
public interface TeacherPinRepository extends JpaRepository<TeacherPin, Long> {
    Optional<TeacherPin> findByPinCode(String pinCode);
}
