package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.request.ClassroomCreateRequest;
import vn.edu.hust.quizflow.dto.request.ClassroomJoinRequest;
import vn.edu.hust.quizflow.dto.response.ClassroomResponse;
import vn.edu.hust.quizflow.service.ClassroomService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassroomController {
    private final ClassroomService classroomService;

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
}
