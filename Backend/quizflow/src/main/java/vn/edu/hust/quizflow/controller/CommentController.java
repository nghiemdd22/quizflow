package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.request.CommentRequest;
import vn.edu.hust.quizflow.dto.response.CommentResponse;
import vn.edu.hust.quizflow.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(commentService.addComment(postId, auth.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = null;
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            username = auth.getName();
        }
        return ResponseEntity.ok(commentService.getComments(postId, username));
    }
}
