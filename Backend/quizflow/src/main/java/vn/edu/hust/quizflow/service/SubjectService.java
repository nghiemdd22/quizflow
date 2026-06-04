package vn.edu.hust.quizflow.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.SubjectDTO;
import vn.edu.hust.quizflow.entity.Subject;
import vn.edu.hust.quizflow.repository.SubjectRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Lớp dịch vụ xử lý nghiệp vụ liên quan đến Môn học (Subject).
 * Bao gồm các tác vụ CRUD: tạo mới, cập nhật, xóa, và tìm kiếm.
 */
@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    /**
     * Tạo mới một môn học.
     * Kiểm tra trùng lặp mã môn học (code) trước khi lưu.
     *
     * @param dto dữ liệu môn học từ client
     * @return DTO môn học sau khi được lưu thành công
     */
    @Transactional
    public SubjectDTO createSubject(SubjectDTO dto) {
        // Kiểm tra xem mã môn học đã được sử dụng chưa
        if (subjectRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Mã môn học đã tồn tại trong hệ thống!");
        }

        // Chuyển đổi từ DTO sang Entity
        Subject subject = Subject.builder()
                .code(dto.getCode().trim())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .build();

        Subject savedSubject = subjectRepository.save(subject);
        return mapToDTO(savedSubject);
    }

    /**
     * Cập nhật thông tin môn học.
     *
     * @param id  ID môn học cần cập nhật
     * @param dto thông tin mới của môn học
     * @return DTO môn học sau khi cập nhật
     */
    @Transactional
    public SubjectDTO updateSubject(Long id, SubjectDTO dto) {
        // Kiểm tra môn học có tồn tại không
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học với ID: " + id));

        // Nếu mã môn học thay đổi, kiểm tra trùng lặp với môn học khác
        if (!subject.getCode().equalsIgnoreCase(dto.getCode().trim())) {
            if (subjectRepository.existsByCode(dto.getCode().trim())) {
                throw new IllegalArgumentException("Mã môn học mới đã được sử dụng bởi môn học khác!");
            }
            subject.setCode(dto.getCode().trim());
        }

        // Cập nhật thông tin khác
        subject.setName(dto.getName().trim());
        subject.setDescription(dto.getDescription());

        Subject updatedSubject = subjectRepository.save(subject);
        return mapToDTO(updatedSubject);
    }

    /**
     * Xóa môn học theo ID.
     *
     * @param id ID của môn học cần xóa
     */
    @Transactional
    public void deleteSubject(Long id) {
        // Kiểm tra môn học có tồn tại không
        if (!subjectRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy môn học với ID: " + id);
        }
        subjectRepository.deleteById(id);
    }

    /**
     * Lấy chi tiết thông tin môn học theo ID.
     *
     * @param id ID môn học cần lấy
     * @return DTO thông tin môn học
     */
    @Transactional(readOnly = true)
    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học với ID: " + id));
        return mapToDTO(subject);
    }

    /**
     * Lấy danh sách tất cả các môn học trong hệ thống.
     *
     * @return Danh sách DTO của tất cả môn học
     */
    @Transactional(readOnly = true)
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Phương thức phụ trợ chuyển đổi từ Entity Subject sang SubjectDTO.
     */
    private SubjectDTO mapToDTO(Subject subject) {
        return SubjectDTO.builder()
                .id(subject.getId())
                .code(subject.getCode())
                .name(subject.getName())
                .description(subject.getDescription())
                .build();
    }
}
