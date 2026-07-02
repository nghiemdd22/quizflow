package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.ExamRoomResponse;
import vn.edu.hust.quizflow.dto.ExamHistoryResponse;
import vn.edu.hust.quizflow.service.ExamSessionService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các yêu cầu HTTP của học sinh (Client) liên quan đến các phiên thi (Exam Session).
 * @RestController chỉ định đây là một Controller dùng cho REST API, tự động chuyển đổi dữ liệu trả về thành định dạng JSON.
 * @RequestMapping("/api/v1/student/sessions") đặt tiền tố chung cho tất cả các đường dẫn API trong class này.
 */
@RestController
@RequestMapping("/api/v1/student/sessions")
@RequiredArgsConstructor
public class StudentSessionController {

    private final ExamSessionService examSessionService;

    /**
     * API cho phép học sinh tham gia vào một phiên thi của một lớp học.
     *
     * @param sessionId ID của phiên thi
     * @param principal Thông tin tài khoản
     * @return Trả về thông tin chi tiết của phòng thi (ExamRoomResponse) nếu tham gia thành công.
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{sessionId}/join")
    public ResponseEntity<ExamRoomResponse> joinSession(
            @PathVariable Long sessionId,
            Principal principal) {
        return ResponseEntity.ok(examSessionService.joinSession(sessionId, principal.getName()));
    }

    /**
     * API giúp học sinh đồng bộ lại trạng thái bài thi đang làm (những câu đã chọn, đáp án tạm thời...)
     * API này đặc biệt hữu ích cho tính năng chịu lỗi: khi học sinh lỡ tay F5 tải lại trang, bị rớt mạng, 
     * hoặc đổi sang máy tính khác thì vẫn có thể lấy lại những đáp án vừa đánh, không bị mất bài.
     *
     * @param sessionId ID của phiên thi mà học sinh đang tham gia.
     * @param principal Thông tin tài khoản của học sinh.
     * @return Trả về một Map chứa toàn bộ dữ liệu làm bài tạm thời của học sinh (thường được lưu trữ trên Redis).
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{sessionId}/sync")
    public ResponseEntity<Map<Object, Object>> syncState(
            @PathVariable Long sessionId,
            Principal principal) {
        // Chuyển việc lấy dữ liệu trạng thái từ Redis cho tầng Service xử lý và trả về cho Frontend
        return ResponseEntity.ok(examSessionService.syncState(sessionId, principal.getName()));
    }

    /**
     * API để học sinh nộp bài thi.
     * API này hoạt động hoàn toàn bất đồng bộ (Async). Backend không đợi chấm điểm xong mà trả về HTTP 202 (Accepted) ngay.
     * BẢO MẬT ZERO-TRUST: Không nhận tham số chứa mảng đáp án từ Frontend để chống gian lận sửa Request.
     * 
     * @param sessionId ID của phiên thi.
     * @param principal Thông tin tài khoản của học sinh.
     * @return HTTP 202 Accepted.
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<Void> submitExam(
            @PathVariable Long sessionId,
            Principal principal) {
        examSessionService.submitExam(sessionId, principal.getName());
        return ResponseEntity.accepted().build(); // HTTP 202
    }

    /**
     * API để học sinh xem lại toàn bộ lịch sử các bài thi đã tham gia.
     * 
     * @param principal Thông tin tài khoản của học sinh.
     * @return Danh sách lịch sử bài thi.
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/history")
    public ResponseEntity<List<ExamHistoryResponse>> getHistory(Principal principal) {
        return ResponseEntity.ok(examSessionService.getStudentHistory(principal.getName()));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/history/{submissionId}")
    public ResponseEntity<vn.edu.hust.quizflow.dto.ExamReviewResponse> getExamReview(
            @PathVariable Long submissionId,
            Principal principal) {
        return ResponseEntity.ok(examSessionService.getExamReview(submissionId, principal.getName()));
    }
}
