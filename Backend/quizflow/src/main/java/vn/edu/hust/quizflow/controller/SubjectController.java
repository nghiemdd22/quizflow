package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.SubjectDTO;
import vn.edu.hust.quizflow.service.SubjectService;

import java.util.List;
import java.util.Map;

/**
 * Controller chịu trách nhiệm định tuyến các API liên quan đến Môn học (Subject).
 * Đường dẫn gốc: /api/v1/subjects
 */
@RestController
@RequestMapping("/api/v1/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    /**
     * Lấy danh sách tất cả các môn học.
     * Cho phép bất kỳ tài khoản nào đã đăng nhập (Học sinh và Giáo viên) đều có thể xem.
     * URL: GET http://localhost:8080/api/v1/subjects
     */
    @GetMapping
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        List<SubjectDTO> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    /**
     * Lấy chi tiết thông tin một môn học theo ID.
     * Cho phép bất kỳ tài khoản nào đã đăng nhập đều có thể xem.
     * URL: GET http://localhost:8080/api/v1/subjects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubjectById(@PathVariable Long id) {
        try {
            SubjectDTO subject = subjectService.getSubjectById(id);
            return ResponseEntity.ok(subject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Tạo mới một môn học.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER).
     * URL: POST http://localhost:8080/api/v1/subjects
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSubject(@Valid @RequestBody SubjectDTO dto) {
        try {
            SubjectDTO createdSubject = subjectService.createSubject(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSubject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin môn học.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER).
     * URL: PUT http://localhost:8080/api/v1/subjects/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectDTO dto) {
        try {
            SubjectDTO updatedSubject = subjectService.updateSubject(id, dto);
            return ResponseEntity.ok(updatedSubject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa một môn học.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER).
     * URL: DELETE http://localhost:8080/api/v1/subjects/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.ok(Map.of("message", "Xóa môn học thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
