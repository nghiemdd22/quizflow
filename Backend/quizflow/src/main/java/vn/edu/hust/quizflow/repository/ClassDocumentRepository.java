package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.ClassDocument;

import java.util.List;

@Repository
public interface ClassDocumentRepository extends JpaRepository<ClassDocument, Long> {
    List<ClassDocument> findByClassroomIdOrderByUploadedAtDesc(Long classroomId);
}
