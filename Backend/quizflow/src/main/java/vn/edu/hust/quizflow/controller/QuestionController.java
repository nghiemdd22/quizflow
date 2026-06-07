package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.QuestionDTO;
import vn.edu.hust.quizflow.service.ExcelService;
import vn.edu.hust.quizflow.service.QuestionService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller chịu trách nhiệm định tuyến các API liên quan đến Câu hỏi (Question).
 * Đường dẫn gốc: /api/v1/questions
 */
@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final ExcelService excelService;

    public QuestionController(QuestionService questionService, ExcelService excelService) {
        this.questionService = questionService;
        this.excelService = excelService;
    }

    /**
     * Lấy danh sách câu hỏi thuộc về một ngân hàng câu hỏi (QuestionBank).
     * Cho phép Học sinh và Giáo viên truy cập (có thể thiết lập sau nếu muốn ẩn với học sinh chưa thi).
     * URL: GET http://localhost:8080/api/v1/questions/bank/{bankId}
     */
    @GetMapping("/bank/{bankId}")
    public ResponseEntity<?> getQuestionsByBankId(@PathVariable Long bankId) {
        try {
            List<QuestionDTO> list = questionService.getQuestionsByBankId(bankId);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lấy chi tiết một câu hỏi theo ID.
     * URL: GET http://localhost:8080/api/v1/questions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Long id) {
        try {
            QuestionDTO question = questionService.getQuestionById(id);
            return ResponseEntity.ok(question);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Tạo mới một câu hỏi.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER) và sở hữu ngân hàng câu hỏi.
     * URL: POST http://localhost:8080/api/v1/questions
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createQuestion(@Valid @RequestBody QuestionDTO dto, Principal principal) {
        try {
            String username = principal.getName();
            QuestionDTO createdQuestion = questionService.createQuestion(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuestion);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin câu hỏi.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER) và kiểm tra tính sở hữu ngân hàng câu hỏi.
     * URL: PUT http://localhost:8080/api/v1/questions/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id,
                                            @Valid @RequestBody QuestionDTO dto,
                                            Principal principal) {
        try {
            String username = principal.getName();
            QuestionDTO updatedQuestion = questionService.updateQuestion(id, dto, username);
            return ResponseEntity.ok(updatedQuestion);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa một câu hỏi.
     * Yêu cầu vai trò giáo viên (ROLE_TEACHER) và kiểm tra quyền sở hữu.
     * URL: DELETE http://localhost:8080/api/v1/questions/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id, Principal principal) {
        try {
            String username = principal.getName();
            questionService.deleteQuestion(id, username);
            return ResponseEntity.ok(Map.of("message", "Xóa câu hỏi thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Nhập danh sách câu hỏi từ file Excel.
     * URL: POST http://localhost:8080/api/v1/questions/bank/{bankId}/import
     */
    @PostMapping("/bank/{bankId}/import")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> importQuestions(@PathVariable Long bankId,
                                             @RequestParam("file") MultipartFile file,
                                             Principal principal) {
        try {
            String username = principal.getName();
            // Validate dung lượng file (vd 5MB = 5 * 1024 * 1024 bytes)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dung lượng file vượt quá 5MB"));
            }
            excelService.importQuestionsFromExcel(bankId, file, username);
            return ResponseEntity.ok(Map.of("message", "Nhập danh sách câu hỏi thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xuất danh sách câu hỏi ra file Excel.
     * URL: GET http://localhost:8080/api/v1/questions/bank/{bankId}/export
     */
    @GetMapping("/bank/{bankId}/export")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> exportQuestions(@PathVariable Long bankId, Principal principal) {
        try {
            // Có thể thêm kiểm tra quyền sở hữu ở đây nếu muốn
            byte[] data = excelService.exportQuestionsToExcel(bankId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "questions_bank_" + bankId + ".xlsx");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi xuất file Excel: " + e.getMessage()));
        }
    }
}
