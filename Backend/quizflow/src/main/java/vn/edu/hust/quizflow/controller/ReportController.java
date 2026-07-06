package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.ReportSessionDetailDTO;
import vn.edu.hust.quizflow.dto.ReportSessionSummaryDTO;
import vn.edu.hust.quizflow.service.ReportService;
import vn.edu.hust.quizflow.service.ExcelService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ExcelService excelService;

    @GetMapping("/teacher/{teacherId}/sessions")
    public ResponseEntity<List<ReportSessionSummaryDTO>> getClosedSessions(@PathVariable Long teacherId) {
        return ResponseEntity.ok(reportService.getClosedSessionsForTeacher(teacherId));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ReportSessionDetailDTO> getSessionDetail(@PathVariable Long sessionId) {
        return ResponseEntity.ok(reportService.getSessionDetail(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/export")
    public ResponseEntity<?> exportSessionReport(@PathVariable Long sessionId) {
        try {
            ReportSessionDetailDTO detail = reportService.getSessionDetail(sessionId);
            byte[] data = excelService.exportScoreboardToExcel(detail);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bang_diem_" + sessionId + ".xlsx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi xuất file Excel: " + e.getMessage());
        }
    }
}
