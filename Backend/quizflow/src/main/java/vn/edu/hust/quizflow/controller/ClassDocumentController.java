package vn.edu.hust.quizflow.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hust.quizflow.dto.ClassDocumentDTO;
import vn.edu.hust.quizflow.service.ClassDocumentService;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/classes/{classId}/documents")
@RequiredArgsConstructor
public class ClassDocumentController {

    private final ClassDocumentService documentService;

    @GetMapping
    public ResponseEntity<List<ClassDocumentDTO>> getDocuments(
            @PathVariable Long classId,
            Principal principal) {
        return ResponseEntity.ok(documentService.getDocuments(classId, principal.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ClassDocumentDTO> uploadDocument(
            @PathVariable Long classId,
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        return ResponseEntity.ok(documentService.uploadDocument(classId, file, principal.getName()));
    }
}
