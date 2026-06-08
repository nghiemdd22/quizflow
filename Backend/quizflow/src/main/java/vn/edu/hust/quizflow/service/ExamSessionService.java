package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.CreateExamSessionRequest;
import vn.edu.hust.quizflow.dto.ExamSessionDTO;
import vn.edu.hust.quizflow.entity.Exam;
import vn.edu.hust.quizflow.entity.ExamSession;
import vn.edu.hust.quizflow.entity.ExamStatus;
import vn.edu.hust.quizflow.entity.SessionStatus;
import vn.edu.hust.quizflow.repository.ExamRepository;
import vn.edu.hust.quizflow.repository.ExamSessionRepository;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamSessionService {

    private final ExamSessionRepository examSessionRepository;
    private final ExamRepository examRepository;

    private static final String DIGITS = "0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Mở một ca thi mới cho một đề thi cụ thể.
     * Tự động chuyển trạng thái đề thi sang PUBLISHED và sinh mã PIN duy nhất.
     * @param examId ID của đề thi
     * @param request Thông tin ca thi (Start time, end time, duration)
     * @param username Người thực hiện
     * @return ExamSessionDTO chứa mã PIN để giao cho học sinh
     */
    @Transactional
    public ExamSessionDTO createSession(Long examId, CreateExamSessionRequest request, String username) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề thi"));

        if (!exam.getTeacher().getUsername().equals(username)) {
            throw new IllegalArgumentException("Bạn không có quyền mở ca thi cho đề này");
        }

        // Cập nhật trạng thái đề thi thành PUBLISHED nếu là lần mở đầu tiên
        if (exam.getStatus() == ExamStatus.DRAFT) {
            exam.setStatus(ExamStatus.PUBLISHED);
            examRepository.save(exam);
        }

        // Sinh mã PIN unique
        String pinCode;
        do {
            pinCode = generateRandomPin(6);
        } while (examSessionRepository.findByPinCode(pinCode).isPresent());

        ExamSession session = ExamSession.builder()
                .exam(exam)
                .title(request.getTitle())
                .pinCode(pinCode)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .status(SessionStatus.UPCOMING)
                .build();

        ExamSession savedSession = examSessionRepository.save(session);
        return mapToDTO(savedSession);
    }

    /**
     * Lấy danh sách các ca thi của một đề thi cụ thể.
     * @param examId ID của đề thi
     * @param username Tên đăng nhập của giáo viên
     * @return Danh sách ExamSessionDTO
     */
    public List<ExamSessionDTO> getSessionsByExamId(Long examId, String username) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề thi"));

        if (!exam.getTeacher().getUsername().equals(username)) {
            throw new IllegalArgumentException("Bạn không có quyền xem thông tin đề thi này");
        }

        return examSessionRepository.findByExamId(examId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private String generateRandomPin(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }

    private ExamSessionDTO mapToDTO(ExamSession session) {
        ExamSessionDTO dto = new ExamSessionDTO();
        dto.setId(session.getId());
        dto.setExamId(session.getExam().getId());
        dto.setTitle(session.getTitle());
        dto.setPinCode(session.getPinCode());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setStatus(session.getStatus());
        return dto;
    }
}
