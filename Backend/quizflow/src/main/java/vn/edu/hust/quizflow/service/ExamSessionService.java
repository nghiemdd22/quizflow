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
import vn.edu.hust.quizflow.dto.ExamHistoryResponse;
import vn.edu.hust.quizflow.dto.ExamRoomResponse;
import vn.edu.hust.quizflow.dto.StudentQuestionDTO;
import vn.edu.hust.quizflow.repository.ExamRepository;
import vn.edu.hust.quizflow.repository.ExamSessionRepository;
import vn.edu.hust.quizflow.repository.UserRepository;
import vn.edu.hust.quizflow.repository.ExamSubmissionRepository;
import vn.edu.hust.quizflow.repository.ExamQuestionRepository;
import vn.edu.hust.quizflow.repository.StudentAnswerRepository;
import vn.edu.hust.quizflow.repository.ClassroomRepository;
import vn.edu.hust.quizflow.repository.ClassMemberRepository;
import vn.edu.hust.quizflow.service.RedisService;
import vn.edu.hust.quizflow.entity.Classroom;

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
    private final StudentAnswerRepository studentAnswerRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassMemberRepository classMemberRepository;
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
        
        Classroom classroom = classroomRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));
                
        if (!classroom.getTeacher().getUsername().equals(username)) {
            throw new IllegalArgumentException("Bạn không có quyền quản lý lớp học này");
        }

        // Cập nhật trạng thái đề thi thành PUBLISHED nếu là lần mở đầu tiên
        if (exam.getStatus() == ExamStatus.DRAFT) {
            exam.setStatus(ExamStatus.PUBLISHED);
            examRepository.save(exam);
        }

        ExamSession session = ExamSession.builder()
                .exam(exam)
                .classroom(classroom)
                .title(request.getTitle())
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

    public List<ExamSessionDTO> getSessionsByClassroomId(Long classroomId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));

        // Nếu là giáo viên, kiểm tra xem có phải chủ lớp không
        if (user.getRole() == vn.edu.hust.quizflow.entity.UserRole.TEACHER) {
            if (!classroom.getTeacher().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Bạn không có quyền truy cập lớp học này");
            }
        } else {
            // Nếu là học sinh, kiểm tra xem có phải thành viên lớp không
            boolean isMember = classMemberRepository.existsByClassroomIdAndStudentId(classroomId, user.getId());
            if (!isMember) {
                throw new IllegalArgumentException("Bạn không thuộc lớp học này");
            }
        }

        return examSessionRepository.findByClassroomId(classroomId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private ExamSessionDTO mapToDTO(ExamSession session) {
        ExamSessionDTO dto = new ExamSessionDTO();
        dto.setId(session.getId());
        dto.setExamId(session.getExam().getId());
        dto.setTitle(session.getTitle());
        dto.setClassId(session.getClassroom().getId());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setStatus(session.getStatus());
        return dto;
    }

    /**
     * Xử lý nghiệp vụ khi học sinh tham gia vào một phiên thi (vào phòng thi).
     * Hàm này chịu trách nhiệm kiểm tra tư cách thành viên, kiểm tra thời gian thi, che giấu
     * đáp án đúng,
     * và tính toán thời gian làm bài thực tế của từng học sinh.
     *
     * @param sessionId  ID của phiên thi
     * @param username Tên đăng nhập của học sinh
     * @return DTO chứa thông tin phòng thi và danh sách câu hỏi (đã che đáp án)
     */
    @Transactional
    public ExamRoomResponse joinSession(Long sessionId, String username) {
        // 1. Kiểm tra mã PIN và lấy thông tin phiên thi
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ca thi"));

        // 2. Lấy thông tin học sinh
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));

        // 2.5 Kiểm tra học sinh có trong lớp không
        boolean isMember = classMemberRepository.existsByClassroomIdAndStudentId(session.getClassroom().getId(), student.getId());
        if (!isMember) {
            throw new IllegalArgumentException("Bạn không thuộc lớp học này nên không thể tham gia thi.");
        }

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
        // Tuy nhiên, nếu trạng thái đã là GRADING hoặc COMPLETED thì không cho phép vào lại thi nữa.
        ExamSubmission submission = examSubmissionRepository
                .findByExamSessionIdAndStudentId(session.getId(), student.getId())
                .map(sub -> {
                    if (sub.getStatus() != SubmissionStatus.IN_PROGRESS) {
                        throw new IllegalArgumentException("Bạn đã nộp bài rồi, không thể vào lại phòng thi.");
                    }
                    return sub;
                })
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
                .username(student.getUsername())
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
                    .username(submission.getStudent().getUsername())
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

    /**
     * Lấy lịch sử bài thi của học sinh.
     *
     * @param username Tên đăng nhập của học sinh
     * @return Danh sách lịch sử bài thi
     */
    public List<ExamHistoryResponse> getStudentHistory(String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));

        List<ExamSubmission> submissions = examSubmissionRepository.findByStudentIdOrderByStartedAtDesc(student.getId());

        return submissions.stream().map(submission -> {
            ExamSession session = submission.getExamSession();
            Exam exam = session.getExam();
            
            return ExamHistoryResponse.builder()
                    .id(submission.getId())
                    .examTitle(exam.getTitle())
                    .subjectName(exam.getSubject().getName())
                    .score(submission.getTotalScore())
                    .startedAt(submission.getStartedAt())
                    .submittedAt(submission.getSubmittedAt())
                    .status(submission.getStatus())
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết bài thi đã nộp của học sinh (để xem lại).
     */
    public vn.edu.hust.quizflow.dto.ExamReviewResponse getExamReview(Long submissionId, String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));

        ExamSubmission submission = examSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài thi"));

        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xem bài thi này");
        }

        List<vn.edu.hust.quizflow.entity.StudentAnswer> answers = studentAnswerRepository.findBySubmissionId(submissionId);

        List<vn.edu.hust.quizflow.dto.QuestionReviewDto> questionDtos = answers.stream().map(ans -> {
            return vn.edu.hust.quizflow.dto.QuestionReviewDto.builder()
                    .questionId(ans.getQuestion().getId())
                    .type(ans.getQuestion().getType())
                    .content(ans.getQuestion().getContent())
                    .metadata(ans.getQuestion().getMetadata())
                    .studentAnswer(ans.getAnswerContent())
                    .isCorrect(ans.getIsCorrect())
                    .scoreAchieved(ans.getScoreAchieved())
                    .build();
        }).collect(Collectors.toList());

        return vn.edu.hust.quizflow.dto.ExamReviewResponse.builder()
                .submissionId(submission.getId())
                .examTitle(submission.getExamSession().getExam().getTitle())
                .subjectName(submission.getExamSession().getExam().getSubject().getName())
                .score(submission.getTotalScore())
                .startedAt(submission.getStartedAt())
                .submittedAt(submission.getSubmittedAt())
                .status(submission.getStatus())
                .questions(questionDtos)
                .build();
    }
}
