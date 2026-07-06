package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hust.quizflow.dto.TeacherDashboardStatsDTO;
import vn.edu.hust.quizflow.service.DashboardService;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/teacher")
    public ResponseEntity<TeacherDashboardStatsDTO> getTeacherDashboardStats(Principal principal) {
        return ResponseEntity.ok(dashboardService.getTeacherDashboardStats(principal.getName()));
    }
}
