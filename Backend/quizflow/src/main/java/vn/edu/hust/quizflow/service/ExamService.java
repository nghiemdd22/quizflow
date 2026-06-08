package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.AddQuestionsRequest;
import vn.edu.hust.quizflow.dto.CreateExamRequest;
import vn.edu.hust.quizflow.dto.ExamDTO;
import vn.edu.hust.quizflow.entity.*;
import vn.edu.hust.quizflow.repository.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final ExamQuestionRepository examQuestionRepository;

    /**
     * Tạo một đề thi mới. Đề thi khi khởi tạo sẽ ở trạng thái DRAFT (Nháp).
     * @param request Dữ liệu đầu vào gồm ID môn học, tiêu đề, mô tả
     * @param username Tên đăng nhập của giáo viên tạo đề thi
     * @return ExamDTO thông tin đề thi vừa tạo
     */
    @Transactional
    public ExamDTO createExam(CreateExamRequest request, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy môn học"));

        Exam exam = Exam.builder()
                .teacher(teacher)
                .subject(subject)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(ExamStatus.DRAFT)
                .build();

        Exam savedExam = examRepository.save(exam);
        return mapToDTO(savedExam);
    }

    /**
     * Lấy toàn bộ danh sách đề thi do giáo viên này tạo.
     * @param username Tên đăng nhập của giáo viên
     * @return Danh sách ExamDTO
     */
    public List<ExamDTO> getExamsByTeacher(String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên"));

        return examRepository.findByTeacherId(teacher.getId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Gắn thêm các câu hỏi vào đề thi. 
     * Chỉ cho phép khi đề thi đang ở trạng thái DRAFT.
     * @param examId ID của đề thi
     * @param request Chứa danh sách các questionId cần thêm
     * @param username Tên đăng nhập của giáo viên
     */
    @Transactional
    public void addQuestionsToExam(Long examId, AddQuestionsRequest request, String username) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề thi"));

        if (!exam.getTeacher().getUsername().equals(username)) {
            throw new IllegalArgumentException("Bạn không có quyền sửa đề thi này");
        }

        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalArgumentException("Chỉ có thể sửa câu hỏi khi đề thi ở trạng thái DRAFT");
        }

        // Lấy số thứ tự hiện tại lớn nhất
        List<ExamQuestion> existingQuestions = examQuestionRepository.findByExamIdOrderByOrderIndexAsc(examId);
        int currentOrder = existingQuestions.size();

        for (Long qId : request.getQuestionIds()) {
            Question question = questionRepository.findById(qId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi ID: " + qId));
            
            // Validate nếu question bank không thuộc về giáo viên này thì k cho thêm (tuỳ chọn)
            if (!question.getQuestionBank().getTeacher().getUsername().equals(username)) {
                throw new IllegalArgumentException("Không thể thêm câu hỏi từ ngân hàng của người khác");
            }

            // Tạo ExamQuestion
            ExamQuestion eq = ExamQuestion.builder()
                    .id(new ExamQuestionId(examId, qId))
                    .exam(exam)
                    .question(question)
                    .scoreWeight(BigDecimal.ONE) // Mặc định 1 điểm
                    .orderIndex(++currentOrder)
                    .build();

            examQuestionRepository.save(eq);
        }
    }

    private ExamDTO mapToDTO(Exam exam) {
        ExamDTO dto = new ExamDTO();
        dto.setId(exam.getId());
        dto.setSubjectId(exam.getSubject().getId());
        dto.setSubjectName(exam.getSubject().getName());
        dto.setTitle(exam.getTitle());
        dto.setDescription(exam.getDescription());
        dto.setStatus(exam.getStatus());
        dto.setCreatedAt(exam.getCreatedAt());
        dto.setUpdatedAt(exam.getUpdatedAt());
        return dto;
    }
}
