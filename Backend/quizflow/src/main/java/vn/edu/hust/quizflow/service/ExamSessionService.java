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
import vn.edu.hust.quizflow.entity.SubmissionStatus;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.entity.ExamSubmission;
import vn.edu.hust.quizflow.entity.ExamQuestion;
import vn.edu.hust.quizflow.dto.ExamRoomResponse;
import vn.edu.hust.quizflow.dto.StudentQuestionDTO;
import vn.edu.hust.quizflow.repository.ExamRepository;
import vn.edu.hust.quizflow.repository.ExamSessionRepository;
import vn.edu.hust.quizflow.repository.UserRepository;
import vn.edu.hust.quizflow.repository.ExamSubmissionRepository;
import vn.edu.hust.quizflow.repository.ExamQuestionRepository;
import vn.edu.hust.quizflow.service.RedisService;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import vn.edu.hust.quizflow.config.RabbitMQConfig;
import vn.edu.hust.quizflow.dto.message.SubmitExamMessage;

/**
 * Service xử lý các logic nghiệp vụ (Business Logic) liên quan đến các phiên
 * thi (Exam Session).
 */
@Service
@RequiredArgsConstructor
public class ExamSessionService {

    private final ExamSessionRepository examSessionRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final RedisService redisService;
    private final RabbitTemplate rabbitTemplate;

    private static final String DIGITS = "0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Mở một ca thi mới cho một đề thi cụ thể.
     * Tự động chuyển trạng thái đề thi sang PUBLISHED và sinh mã PIN duy nhất.
     * 
     * @param examId   ID của đề thi
     * @param request  Thông tin ca thi (Start time, end time, duration)
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
     * 
     * @param examId   ID của đề thi
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

    /**
     * Xử lý nghiệp vụ khi học sinh tham gia vào một phiên thi (vào phòng thi).
     * Hàm này chịu trách nhiệm kiểm tra mã PIN, kiểm tra thời gian thi, che giấu
     * đáp án đúng,
     * và tính toán thời gian làm bài thực tế của từng học sinh.
     *
     * @param pinCode  Mã PIN của phòng thi do học sinh nhập
     * @param username Tên đăng nhập của học sinh
     * @return DTO chứa thông tin phòng thi và danh sách câu hỏi (đã che đáp án)
     */
    @Transactional
    public ExamRoomResponse joinSession(String pinCode, String username) {
        // 1. Kiểm tra mã PIN và lấy thông tin phiên thi
        ExamSession session = examSessionRepository.findByPinCode(pinCode)
                .orElseThrow(() -> new IllegalArgumentException("Mã PIN không hợp lệ"));

        // 2. Lấy thông tin học sinh
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));

        // 3. Kiểm tra mốc thời gian (Ca thi đã đến giờ mở chưa, hoặc đã kết thúc chưa)
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(session.getStartTime())) {
            throw new IllegalArgumentException("Ca thi chưa bắt đầu");
        }
        if (now.isAfter(session.getEndTime())) {
            throw new IllegalArgumentException("Ca thi đã kết thúc");
        }

        // 4. Nếu đây là học sinh đầu tiên vào thi (trạng thái phòng vẫn là UPCOMING),
        // thì tự động chuyển trạng thái phòng sang ACTIVE (Đang thi)
        if (session.getStatus() == SessionStatus.UPCOMING) {
            session.setStatus(SessionStatus.ACTIVE);
            examSessionRepository.save(session);
        }

        // 5. Kiểm tra xem học sinh này đã có hồ sơ bài nộp (ExamSubmission) trong ca
        // thi này chưa.
        // - Nếu chưa có (nghĩa là mới vào lần đầu): Tạo mới một bản ghi để bắt đầu tính
        // giờ làm bài.
        // - Nếu có rồi (nghĩa là rớt mạng F5 vô lại): Dùng lại hồ sơ cũ, thời gian bắt
        // đầu vẫn giữ nguyên.
        ExamSubmission submission = examSubmissionRepository
                .findByExamSessionIdAndStudentId(session.getId(), student.getId())
                .orElseGet(() -> {
                    ExamSubmission newSubmission = ExamSubmission.builder()
                            .examSession(session)
                            .student(student)
                            .status(SubmissionStatus.IN_PROGRESS)
                            .startedAt(now)
                            .build();
                    return examSubmissionRepository.save(newSubmission);
                });

        // 6. Kéo danh sách câu hỏi của đề thi, sắp xếp theo đúng số thứ tự
        List<ExamQuestion> examQuestions = examQuestionRepository
                .findByExamIdOrderByOrderIndexAsc(session.getExam().getId());

        // 7. BƯỚC BẢO MẬT QUAN TRỌNG: Che giấu đáp án đúng trước khi trả câu hỏi về cho
        // học sinh (Frontend)
        List<StudentQuestionDTO> studentQuestions = examQuestions.stream().map(eq -> {
            // Clone (tạo bản sao) của metadata ra một Map mới để không vô tình sửa xóa luôn
            // cả dữ liệu gốc trong DB
            Map<String, Object> safeMetadata = new HashMap<>(eq.getQuestion().getMetadata());
            // Xóa đi trường "correctAnswers", nhờ vậy học sinh không thể bấm F12 xem mã
            // nguồn để gian lận đáp án được
            safeMetadata.remove("correctAnswers");

            return StudentQuestionDTO.builder()
                    .id(eq.getQuestion().getId())
                    .type(eq.getQuestion().getType())
                    .content(eq.getQuestion().getContent())
                    .metadata(safeMetadata) // Đưa metadata "an toàn" vào DTO
                    .build();
        }).collect(Collectors.toList());

        // 8. Tính toán mốc thời gian nộp bài chính xác cho từng cá nhân học sinh
        // Mặc định, hạn chót nộp bài là giờ đóng cửa của toàn bộ ca thi (EndTime của
        // ca)
        LocalDateTime finalEndTime = session.getEndTime();
        // Tuy nhiên, nếu đề thi có bấm giờ làm bài (ví dụ đề 45 phút - durationMinutes
        // > 0)
        if (session.getDurationMinutes() > 0) {
            // Thì tính giờ hết hạn của riêng học sinh này = Thời điểm học sinh bấm bắt đầu
            // (startedAt) + 45 phút
            LocalDateTime durationEnd = submission.getStartedAt().plusMinutes(session.getDurationMinutes());
            // So sánh 2 mốc thời gian trên và trả về mốc nào ĐẾN TRƯỚC.
            // Điều này phòng chống trường hợp: Ca thi sắp đóng cửa vào lúc 10h, mà 9h45 học
            // sinh mới vào,
            // thì làm được 15 phút là hệ thống vẫn bắt nộp bài vì ca thi đã đóng, dù cho
            // thời gian làm bài quy định là 45p.
            if (durationEnd.isBefore(finalEndTime)) {
                finalEndTime = durationEnd;
            }
        }

        // 9. Đóng gói toàn bộ dữ liệu hợp lệ và trả về cho Frontend hiển thị
        return ExamRoomResponse.builder()
                .sessionId(session.getId())
                .examTitle(session.getExam().getTitle())
                .status(session.getStatus())
                .startTime(session.getStartTime())
                .endTime(finalEndTime)
                .serverTime(now)
                .durationMinutes(session.getDurationMinutes())
                .submissionId(submission.getId())
                .questions(studentQuestions)
                .build();
    }

    /**
     * Lấy lại trạng thái bài làm (các đáp án đã chọn) của học sinh từ Redis.
     * Dùng để đồng bộ giao diện khi học sinh bị mất mạng, F5 tải lại trang.
     *
     * @param sessionId ID của ca thi
     * @param username  Tên đăng nhập của học sinh
     * @return Một Map dạng (Mã câu hỏi : Mã lựa chọn)
     */
    public Map<Object, Object> syncState(Long sessionId, String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));
        return redisService.getStudentAnswers(sessionId, student.getId());
    }

    /**
     * Nộp bài thi bất đồng bộ an toàn (Zero-Trust/Backend-Driven).
     * Tuyệt đối không đọc danh sách đáp án từ tham số để tránh rủi ro gian lận chặn
     * bắt Request (Client-side Manipulation).
     * Backend sẽ lấy đáp án trực tiếp từ Redis làm Nguồn chân lý, sau đó đẩy vào
     * RabbitMQ để các Worker chấm điểm.
     *
     * @param sessionId ID của ca thi
     * @param username  Tên đăng nhập của học sinh
     */
    @Transactional
    public void submitExam(Long sessionId, String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));

        ExamSubmission submission = examSubmissionRepository
                .findByExamSessionIdAndStudentId(sessionId, student.getId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dữ liệu làm bài của học sinh này"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Bài thi này đã được nộp hoặc đang được chấm điểm.");
        }

        // Đổi trạng thái sang Đang Chấm Điểm (GRADING)
        submission.setStatus(SubmissionStatus.GRADING);
        examSubmissionRepository.save(submission);

        // Lấy "Nguồn chân lý" từ Redis (tất cả các cú click của học sinh trong thời
        // gian làm bài)
        Map<Object, Object> rawAnswers = redisService.getStudentAnswers(sessionId, student.getId());
        Map<Long, Object> cleanAnswers = new HashMap<>();

        for (Map.Entry<Object, Object> entry : rawAnswers.entrySet()) {
            try {
                Long questionId = Long.parseLong(entry.getKey().toString());
                cleanAnswers.put(questionId, entry.getValue());
            } catch (NumberFormatException ignored) {
            }
        }

        // Đóng gói Message Payload
        SubmitExamMessage message = SubmitExamMessage.builder()
                .studentId(student.getId())
                .examSessionId(sessionId)
                .answers(cleanAnswers)
                .build();

        // Xóa ngay lập tức key trên Redis để giải phóng RAM, vì toàn bộ dữ liệu 
        // đã được nhồi vào Message (RabbitMQ đảm bảo tính bền vững của Message)
        redisService.clearStudentAnswers(sessionId, student.getId());

        // Ném vào RabbitMQ để giải phóng luồng, Worker sẽ bắt lấy và chấm điểm
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.SUBMIT_EXAM_EXCHANGE,
                RabbitMQConfig.SUBMIT_EXAM_ROUTING_KEY,
                message);
    }

    /**
     * Tự động thu bài cho tất cả học sinh chưa nộp bài khi ca thi bị đóng bởi
     * CronJob.
     * Tái sử dụng lại logic gửi RabbitMQ tương tự như nộp bài thủ công.
     */
    @Transactional
    public void forceSubmitAllPendingSubmissions(Long sessionId) {
        // 1. Quét Database tìm tất cả học sinh đang trong trạng thái IN_PROGRESS (chưa nộp bài)
        List<ExamSubmission> pendingSubmissions = examSubmissionRepository.findByExamSessionIdAndStatus(sessionId,
                SubmissionStatus.IN_PROGRESS);
                
        for (ExamSubmission submission : pendingSubmissions) {
            // 2. Lập tức đổi trạng thái sang GRADING để khóa bài thi, ngăn chặn học sinh tiếp tục thao tác
            submission.setStatus(SubmissionStatus.GRADING);
            examSubmissionRepository.save(submission);

            // 3. Truy xuất "Nguồn chân lý" từ Redis (Dữ liệu do WebSocket liên tục đồng bộ xuống trước đó)
            Map<Object, Object> rawAnswers = redisService.getStudentAnswers(sessionId, submission.getStudent().getId());
            Map<Long, Object> cleanAnswers = new HashMap<>();

            // 4. Ép kiểu dữ liệu (từ Object sang Long cho key) để đảm bảo tính toàn vẹn dữ liệu
            for (Map.Entry<Object, Object> entry : rawAnswers.entrySet()) {
                try {
                    Long questionId = Long.parseLong(entry.getKey().toString());
                    cleanAnswers.put(questionId, entry.getValue());
                } catch (NumberFormatException ignored) {
                    // Bỏ qua nếu có dữ liệu rác không hợp lệ trong Redis
                }
            }

            // 5. Đóng gói bộ đáp án hoàn chỉnh thành Message
            SubmitExamMessage message = SubmitExamMessage.builder()
                    .studentId(submission.getStudent().getId())
                    .examSessionId(sessionId)
                    .answers(cleanAnswers)
                    .build();

            // 6. Xóa ngay lập tức key trên Redis
            redisService.clearStudentAnswers(sessionId, submission.getStudent().getId());

            // 7. Đẩy Message vào hàng đợi (RabbitMQ). Background Worker sẽ tự động hứng lấy và tiến hành chấm điểm.
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.SUBMIT_EXAM_EXCHANGE,
                    RabbitMQConfig.SUBMIT_EXAM_ROUTING_KEY,
                    message);
        }
    }
}
