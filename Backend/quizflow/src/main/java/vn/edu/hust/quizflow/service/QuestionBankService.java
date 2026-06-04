package vn.edu.hust.quizflow.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.QuestionBankDTO;
import vn.edu.hust.quizflow.entity.QuestionBank;
import vn.edu.hust.quizflow.entity.Subject;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.repository.QuestionBankRepository;
import vn.edu.hust.quizflow.repository.SubjectRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Lớp dịch vụ xử lý nghiệp vụ liên quan đến Ngân hàng câu hỏi (QuestionBank).
 * Cung cấp các thao tác CRUD và kiểm tra quyền sở hữu đối với Giáo viên.
 */
@Service
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public QuestionBankService(QuestionBankRepository questionBankRepository,
                               SubjectRepository subjectRepository,
                               UserRepository userRepository) {
        this.questionBankRepository = questionBankRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    /**
     * Tạo mới một ngân hàng câu hỏi.
     * Liên kết với Môn học theo subjectId và Giáo viên đang đăng nhập.
     *
     * @param dto      dữ liệu tạo mới từ client
     * @param username tên đăng nhập của Giáo viên đang tạo
     * @return DTO ngân hàng câu hỏi sau khi lưu
     */
    @Transactional
    public QuestionBankDTO createQuestionBank(QuestionBankDTO dto, String username) {
        // Lấy thông tin Giáo viên đang đăng nhập
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin giáo viên đăng nhập!"));

        // Lấy thông tin Môn học liên kết
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học với ID: " + dto.getSubjectId()));

        // Khởi tạo Entity QuestionBank
        QuestionBank questionBank = QuestionBank.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .subject(subject)
                .teacher(teacher)
                .build();

        QuestionBank savedBank = questionBankRepository.save(questionBank);
        return mapToDTO(savedBank);
    }

    /**
     * Cập nhật thông tin ngân hàng câu hỏi.
     * Xác thực quyền sở hữu: Giáo viên chỉ được sửa ngân hàng câu hỏi do mình tạo ra.
     *
     * @param id       ID của ngân hàng câu hỏi cần sửa
     * @param dto      thông tin cập nhật mới
     * @param username tên đăng nhập của Giáo viên yêu cầu cập nhật
     * @return DTO ngân hàng câu hỏi sau khi cập nhật
     */
    @Transactional
    public QuestionBankDTO updateQuestionBank(Long id, QuestionBankDTO dto, String username) {
        // Tìm ngân hàng câu hỏi cần sửa
        QuestionBank questionBank = questionBankRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngân hàng câu hỏi với ID: " + id));

        // Kiểm tra quyền sở hữu (ownership check)
        if (!questionBank.getTeacher().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền sửa đổi ngân hàng câu hỏi này!");
        }

        // Cập nhật môn học nếu có sự thay đổi
        if (!questionBank.getSubject().getId().equals(dto.getSubjectId())) {
            Subject newSubject = subjectRepository.findById(dto.getSubjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học mới với ID: " + dto.getSubjectId()));
            questionBank.setSubject(newSubject);
        }

        // Cập nhật tiêu đề và mô tả
        questionBank.setTitle(dto.getTitle().trim());
        questionBank.setDescription(dto.getDescription());

        QuestionBank updatedBank = questionBankRepository.save(questionBank);
        return mapToDTO(updatedBank);
    }

    /**
     * Xóa một ngân hàng câu hỏi theo ID.
     * Xác thực quyền sở hữu trước khi thực hiện xóa.
     *
     * @param id       ID của ngân hàng câu hỏi cần xóa
     * @param username tên đăng nhập của Giáo viên yêu cầu xóa
     */
    @Transactional
    public void deleteQuestionBank(Long id, String username) {
        // Tìm ngân hàng câu hỏi cần xóa
        QuestionBank questionBank = questionBankRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngân hàng câu hỏi với ID: " + id));

        // Kiểm tra quyền sở hữu
        if (!questionBank.getTeacher().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền xóa ngân hàng câu hỏi này!");
        }

        questionBankRepository.delete(questionBank);
    }

    /**
     * Lấy chi tiết thông tin ngân hàng câu hỏi theo ID.
     *
     * @param id ID ngân hàng câu hỏi cần lấy
     * @return DTO ngân hàng câu hỏi
     */
    @Transactional(readOnly = true)
    public QuestionBankDTO getQuestionBankById(Long id) {
        QuestionBank questionBank = questionBankRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngân hàng câu hỏi với ID: " + id));
        return mapToDTO(questionBank);
    }

    /**
     * Lấy danh sách toàn bộ ngân hàng câu hỏi trong hệ thống.
     *
     * @return danh sách DTO của toàn bộ ngân hàng câu hỏi
     */
    @Transactional(readOnly = true)
    public List<QuestionBankDTO> getAllQuestionBanks() {
        return questionBankRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách ngân hàng câu hỏi theo ID của Giáo viên sở hữu.
     *
     * @param teacherId ID của giáo viên
     * @return danh sách ngân hàng câu hỏi thuộc giáo viên đó
     */
    @Transactional(readOnly = true)
    public List<QuestionBankDTO> getQuestionBanksByTeacher(Long teacherId) {
        return questionBankRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách ngân hàng câu hỏi thuộc về một môn học cụ thể.
     *
     * @param subjectId ID môn học
     * @return danh sách ngân hàng câu hỏi thuộc môn học đó
     */
    @Transactional(readOnly = true)
    public List<QuestionBankDTO> getQuestionBanksBySubject(Long subjectId) {
        return questionBankRepository.findBySubjectId(subjectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Phương thức phụ trợ chuyển đổi từ Entity sang DTO.
     */
    private QuestionBankDTO mapToDTO(QuestionBank questionBank) {
        return QuestionBankDTO.builder()
                .id(questionBank.getId())
                .title(questionBank.getTitle())
                .description(questionBank.getDescription())
                .subjectId(questionBank.getSubject().getId())
                .teacherId(questionBank.getTeacher().getId())
                .teacherName(questionBank.getTeacher().getFullName())
                .createdAt(questionBank.getCreatedAt())
                .build();
    }
}
