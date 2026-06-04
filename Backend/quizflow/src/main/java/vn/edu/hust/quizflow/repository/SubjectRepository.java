package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.Subject;

import java.util.Optional;

/**
 * Giao diện Repository để thực hiện các thao tác dữ liệu với bảng 'subjects' (Môn học).
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    /**
     * Tìm kiếm môn học theo mã môn học (code).
     *
     * @param code mã môn học cần tìm
     * @return Optional chứa đối tượng Subject nếu tồn tại
     */
    Optional<Subject> findByCode(String code);

    /**
     * Kiểm tra xem mã môn học đã tồn tại trong hệ thống chưa.
     *
     * @param code mã môn học cần kiểm tra
     * @return true nếu mã môn học đã tồn tại, ngược lại trả về false
     */
    boolean existsByCode(String code);
}
