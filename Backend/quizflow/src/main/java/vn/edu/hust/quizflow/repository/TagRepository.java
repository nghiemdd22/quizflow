package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.Tag;

import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);
}
