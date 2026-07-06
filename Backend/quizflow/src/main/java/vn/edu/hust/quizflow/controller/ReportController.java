package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.ReportSessionDetailDTO;
import vn.edu.hust.quizflow.dto.ReportSessionSummaryDTO;
import vn.edu.hust.quizflow.service.ReportService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/teacher/{teacherId}/sessions")
    public ResponseEntity<List<ReportSessionSummaryDTO>> getClosedSessions(@PathVariable Long teacherId) {
        return ResponseEntity.ok(reportService.getClosedSessionsForTeacher(teacherId));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ReportSessionDetailDTO> getSessionDetail(@PathVariable Long sessionId) {
        return ResponseEntity.ok(reportService.getSessionDetail(sessionId));
    }
}
