package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.AdminStatsDTO;
import vn.edu.hust.quizflow.dto.AdminUserDTO;
import vn.edu.hust.quizflow.dto.TeacherPinDTO;
import vn.edu.hust.quizflow.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        adminService.toggleUserStatus(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pins")
    public ResponseEntity<List<TeacherPinDTO>> getAllPins() {
        return ResponseEntity.ok(adminService.getAllPins());
    }

    @PostMapping("/pins")
    public ResponseEntity<TeacherPinDTO> createPin(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(adminService.createPin(username));
    }

    @PostMapping("/pins/{id}/toggle")
    public ResponseEntity<?> togglePinStatus(@PathVariable Long id) {
        adminService.togglePinStatus(id);
        return ResponseEntity.ok().build();
    }
}
