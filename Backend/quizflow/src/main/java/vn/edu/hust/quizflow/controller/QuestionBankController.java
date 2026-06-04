package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.QuestionBankDTO;
import vn.edu.hust.quizflow.service.QuestionBankService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller chịu trách nhiệm định tuyến các API liên quan đến Ngân hàng câu hỏi (QuestionBank).
 * Đường dẫn gốc: /api/v1/question-banks
 */
@RestController
@RequestMapping("/api/v1/question-banks")
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    public QuestionBankController(QuestionBankService questionBankService) {
        this.questionBankService = questionBankService;
    }

    /**
     * Lấy danh sách tất cả các ngân hàng câu hỏi.
     * Cho phép Học sinh và Giáo viên truy cập.
     * URL: GET http://localhost:8080/api/v1/question-banks
     */
    @GetMapping
    public ResponseEntity<List<QuestionBankDTO>> getAllQuestionBanks() {
        List<QuestionBankDTO> list = questionBankService.getAllQuestionBanks();
        return ResponseEntity.ok(list);
    }

    /**
     * Lấy chi tiết thông tin một ngân hàng câu hỏi theo ID.
     * URL: GET http://localhost:8080/api/v1/question-banks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionBankById(@PathVariable Long id) {
        try {
            QuestionBankDTO bank = questionBankService.getQuestionBankById(id);
            return ResponseEntity.ok(bank);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lấy danh sách ngân hàng câu hỏi thuộc về một môn học cụ thể.
     * URL: GET http://localhost:8080/api/v1/question-banks/subject/{subjectId}
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<QuestionBankDTO>> getQuestionBanksBySubject(@PathVariable Long subjectId) {
        List<QuestionBankDTO> list = questionBankService.getQuestionBanksBySubject(subjectId);
        return ResponseEntity.ok(list);
    }

    /**
     * Lấy danh sách ngân hàng câu hỏi do một giáo viên cụ thể quản lý.
     * URL: GET http://localhost:8080/api/v1/question-banks/teacher/{teacherId}
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<QuestionBankDTO>> getQuestionBanksByTeacher(@PathVariable Long teacherId) {
        List<QuestionBankDTO> list = questionBankService.getQuestionBanksByTeacher(teacherId);
        return ResponseEntity.ok(list);
    }

    /**
     * Tạo mới một ngân hàng câu hỏi.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER). Lấy thông tin tài khoản đang đăng nhập để làm chủ sở hữu.
     * URL: POST http://localhost:8080/api/v1/question-banks
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createQuestionBank(@Valid @RequestBody QuestionBankDTO dto, Principal principal) {
        try {
            // Lấy tên tài khoản giáo viên đăng nhập từ Principal
            String username = principal.getName();
            QuestionBankDTO createdBank = questionBankService.createQuestionBank(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBank);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin ngân hàng câu hỏi.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER) và kiểm tra tính sở hữu ngân hàng câu hỏi.
     * URL: PUT http://localhost:8080/api/v1/question-banks/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateQuestionBank(@PathVariable Long id, 
                                                @Valid @RequestBody QuestionBankDTO dto, 
                                                Principal principal) {
        try {
            String username = principal.getName();
            QuestionBankDTO updatedBank = questionBankService.updateQuestionBank(id, dto, username);
            return ResponseEntity.ok(updatedBank);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            // Trả về 403 Forbidden nếu giáo viên khác cố tình cập nhật
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa một ngân hàng câu hỏi.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER) và kiểm tra quyền sở hữu.
     * URL: DELETE http://localhost:8080/api/v1/question-banks/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteQuestionBank(@PathVariable Long id, Principal principal) {
        try {
            String username = principal.getName();
            questionBankService.deleteQuestionBank(id, username);
            return ResponseEntity.ok(Map.of("message", "Xóa ngân hàng câu hỏi thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            // Trả về 403 Forbidden nếu giáo viên khác cố tình xóa
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
