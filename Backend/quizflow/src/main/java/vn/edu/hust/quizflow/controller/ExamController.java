package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.*;
import vn.edu.hust.quizflow.dto.ExamSessionDTO;
import vn.edu.hust.quizflow.dto.ProctoringStudentDTO;
import vn.edu.hust.quizflow.dto.ProctoringDashboardDTO;
import vn.edu.hust.quizflow.service.ExamService;
import vn.edu.hust.quizflow.service.ExamSessionService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final ExamSessionService examSessionService;

    /**
     * API tạo mới một đề thi (Exam).
     * Chỉ giáo viên mới có quyền gọi API này.
     * @param request Thông tin đề thi (Tên, mô tả, ID môn học)
     * @param principal Thông tin tài khoản đăng nhập (JWT token)
     * @return 200 OK kèm theo đối tượng ExamDTO vừa tạo
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<ExamDTO> createExam(@Valid @RequestBody CreateExamRequest request, Principal principal) {
        return ResponseEntity.ok(examService.createExam(request, principal.getName()));
    }

    /**
     * API lấy danh sách toàn bộ đề thi mà giáo viên đang đăng nhập đã tạo.
     * @param principal Thông tin tài khoản đăng nhập
     * @return 200 OK kèm danh sách ExamDTO
     */
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping
    public ResponseEntity<List<ExamDTO>> getMyExams(Principal principal) {
        return ResponseEntity.ok(examService.getExamsByTeacher(principal.getName()));
    }

    /**
     * API thêm một danh sách câu hỏi vào một đề thi cụ thể.
     * Chỉ cho phép thực hiện khi đề thi đang ở trạng thái DRAFT (Nháp).
     * @param examId ID của đề thi trên đường dẫn (Path Variable)
     * @param request Mảng các ID câu hỏi cần thêm vào đề
     * @param principal Thông tin tài khoản đăng nhập
     * @return 200 OK kèm lời nhắn thành công
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/{examId}/questions")
    public ResponseEntity<String> addQuestionsToExam(
            @PathVariable Long examId,
            @Valid @RequestBody AddQuestionsRequest request,
            Principal principal) {
        examService.addQuestionsToExam(examId, request, principal.getName());
        return ResponseEntity.ok("Thêm câu hỏi vào đề thi thành công");
    }

    /**
     * API mở một Ca thi mới (Exam Session) cho đề thi tương ứng.
     * Sẽ tự động chuyển đổi trạng thái đề thi sang PUBLISHED và sinh một mã PIN 6 số.
     * @param examId ID đề thi
     * @param request Các cấu hình về thời gian ca thi (bắt đầu, kết thúc, thời lượng)
     * @param principal Thông tin tài khoản
     * @return 200 OK kèm thông tin Ca thi (bao gồm mã PIN)
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/{examId}/sessions")
    public ResponseEntity<ExamSessionDTO> createSession(
            @PathVariable Long examId,
            @Valid @RequestBody CreateExamSessionRequest request,
            Principal principal) {
        return ResponseEntity.ok(examSessionService.createSession(examId, request, principal.getName()));
    }

    /**
     * API lấy danh sách các ca thi đã tạo của một đề thi cụ thể.
     * @param examId ID của đề thi
     * @param principal Thông tin tài khoản
     * @return 200 OK kèm danh sách ExamSessionDTO
     */
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/{examId}/sessions")
    public ResponseEntity<List<ExamSessionDTO>> getSessions(
            @PathVariable Long examId,
            Principal principal) {
        return ResponseEntity.ok(examSessionService.getSessionsByExamId(examId, principal.getName()));
    }

    /**
     * API lấy danh sách các hành vi gian lận của một ca thi cụ thể.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/sessions/{sessionId}/proctoring-data")
    public ResponseEntity<ProctoringDashboardDTO> getProctoringData(
            @PathVariable Long sessionId,
            Principal principal) {
        return ResponseEntity.ok(examSessionService.getProctoringData(sessionId, principal.getName()));
    }
}
