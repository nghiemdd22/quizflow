package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.entity.UserRole;

import java.util.Optional;

/**
 * Giao diện Repository để thao tác dữ liệu với bảng 'users' trong database.
 * Kế thừa JpaRepository để tự động có các phương thức CRUD cơ bản (save, delete, findById...).
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Tìm kiếm người dùng theo tên đăng nhập (username).
     *
     * @param username tên đăng nhập cần tìm
     * @return Optional chứa đối tượng User nếu tìm thấy, ngược lại là rỗng
     */
    Optional<User> findByUsername(String username);
    
    long countByRole(UserRole role);
}
