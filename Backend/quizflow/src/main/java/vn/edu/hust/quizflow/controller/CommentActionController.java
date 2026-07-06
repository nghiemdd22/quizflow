package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.service.CommentService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentActionController {

    private final CommentService commentService;

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteComment(@PathVariable Long id, @RequestParam int type) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        commentService.voteComment(id, auth.getName(), type);
        return ResponseEntity.ok(Map.of("message", "Vote thành công"));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<?> acceptComment(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        commentService.acceptComment(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu câu trả lời đúng"));
    }
}
