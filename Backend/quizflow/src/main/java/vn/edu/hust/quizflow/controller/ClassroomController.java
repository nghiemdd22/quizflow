package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.request.ClassroomCreateRequest;
import vn.edu.hust.quizflow.dto.request.ClassroomUpdateRequest;
import vn.edu.hust.quizflow.dto.request.ClassroomJoinRequest;
import vn.edu.hust.quizflow.dto.response.ClassroomResponse;
import vn.edu.hust.quizflow.dto.ExamSessionDTO;
import vn.edu.hust.quizflow.service.ClassroomService;
import vn.edu.hust.quizflow.service.ExamSessionService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassroomController {
    private final ClassroomService classroomService;
    private final ExamSessionService examSessionService;

    @PostMapping
    public ResponseEntity<ClassroomResponse> createClassroom(
            @Valid @RequestBody ClassroomCreateRequest request,
            Principal principal) {
        return ResponseEntity.ok(classroomService.createClassroom(request, principal.getName()));
    }

    @PostMapping("/join")
    public ResponseEntity<ClassroomResponse> joinClassroom(
            @Valid @RequestBody ClassroomJoinRequest request,
            Principal principal) {
        return ResponseEntity.ok(classroomService.joinClassroom(request.getCode(), principal.getName()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ClassroomResponse>> getMyClassrooms(
            Principal principal) {
        return ResponseEntity.ok(classroomService.getMyClassrooms(principal.getName()));
    }

    @PutMapping("/{classId}")
    public ResponseEntity<ClassroomResponse> updateClassroom(
            @PathVariable Long classId,
            @Valid @RequestBody ClassroomUpdateRequest request,
            Principal principal) {
        return ResponseEntity.ok(classroomService.updateClass(classId, request, principal.getName()));
    }

    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClassroom(
            @PathVariable Long classId,
            Principal principal) {
        classroomService.deleteClass(classId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{classId}/sessions")
    public ResponseEntity<List<ExamSessionDTO>> getClassSessions(
            @PathVariable Long classId,
            Principal principal) {
        // We need a method in ExamSessionService to get sessions by classId
        // that also checks if the user is a member of the class.
        return ResponseEntity.ok(examSessionService.getSessionsByClassroomId(classId, principal.getName()));
    }
}
