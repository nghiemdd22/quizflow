package vn.edu.hust.quizflow.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.request.CreatePostRequest;
import vn.edu.hust.quizflow.dto.response.PostResponse;
import vn.edu.hust.quizflow.service.PostService;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getPosts(PageRequest.of(page, size)));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam String q) {
        return ResponseEntity.ok(postService.searchPosts(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostDetail(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = null;
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            username = auth.getName();
        }
        return ResponseEntity.ok(postService.getPostDetail(id, username));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<PostResponse> createPost(@Valid @ModelAttribute CreatePostRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(postService.createPost(username, request));
    }
}
