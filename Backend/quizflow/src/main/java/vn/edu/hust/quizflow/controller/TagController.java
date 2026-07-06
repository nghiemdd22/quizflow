package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.quizflow.dto.response.TagResponse;
import vn.edu.hust.quizflow.service.TagService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @PostMapping
    public ResponseEntity<TagResponse> createTag(@RequestParam String name) {
        return ResponseEntity.ok(tagService.createTag(name));
    }
}
