package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hust.quizflow.dto.ClassDocumentDTO;
import vn.edu.hust.quizflow.entity.ClassDocument;
import vn.edu.hust.quizflow.entity.Classroom;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.ClassDocumentRepository;
import vn.edu.hust.quizflow.repository.ClassMemberRepository;
import vn.edu.hust.quizflow.repository.ClassroomRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassDocumentService {

    private final ClassDocumentRepository documentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<ClassDocumentDTO> getDocuments(Long classId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));

        checkAccess(classroom, user);

        return documentRepository.findByClassroomIdOrderByUploadedAtDesc(classId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClassDocumentDTO uploadDocument(Long classId, MultipartFile file, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));

        if (!classroom.getTeacher().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Chỉ giáo viên mới được phép tải lên tài liệu");
        }

        Map uploadResult = cloudinaryService.uploadFile(file);
        String fileUrl = (String) uploadResult.get("secure_url");
        String format = (String) uploadResult.get("format");
        if (format == null) {
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                format = originalName.substring(originalName.lastIndexOf(".") + 1);
            }
        }

        ClassDocument document = ClassDocument.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .format(format)
                .sizeBytes(file.getSize())
                .classroom(classroom)
                .uploader(user)
                .build();

        document = documentRepository.save(document);
        return mapToDTO(document);
    }

    private void checkAccess(Classroom classroom, User user) {
        if (user.getRole() == vn.edu.hust.quizflow.entity.UserRole.TEACHER) {
            if (!classroom.getTeacher().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Bạn không có quyền truy cập lớp học này");
            }
        } else {
            boolean isMember = classMemberRepository.existsByClassroomIdAndStudentId(classroom.getId(), user.getId());
            if (!isMember) {
                throw new IllegalArgumentException("Bạn không thuộc lớp học này");
            }
        }
    }

    private ClassDocumentDTO mapToDTO(ClassDocument doc) {
        return ClassDocumentDTO.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileUrl(doc.getFileUrl())
                .format(doc.getFormat())
                .sizeBytes(doc.getSizeBytes())
                .uploadedAt(doc.getUploadedAt())
                .uploaderName(doc.getUploader().getFullName() != null ? doc.getUploader().getFullName() : doc.getUploader().getUsername())
                .build();
    }
}
