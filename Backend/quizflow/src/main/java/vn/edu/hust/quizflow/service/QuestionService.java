package vn.edu.hust.quizflow.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.QuestionDTO;
import vn.edu.hust.quizflow.dto.QuestionOrderUpdateDto;
import vn.edu.hust.quizflow.entity.Question;
import vn.edu.hust.quizflow.entity.QuestionBank;
import vn.edu.hust.quizflow.repository.QuestionBankRepository;
import vn.edu.hust.quizflow.repository.QuestionRepository;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionBankRepository questionBankRepository;

    public QuestionService(QuestionRepository questionRepository, QuestionBankRepository questionBankRepository) {
        this.questionRepository = questionRepository;
        this.questionBankRepository = questionBankRepository;
    }

    /**
     * Lấy danh sách tất cả câu hỏi trong một ngân hàng câu hỏi.
     */
    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsByBankId(Long bankId) {
        // Kiểm tra xem bank có tồn tại không
        if (!questionBankRepository.existsById(bankId)) {
            throw new IllegalArgumentException("Ngân hàng câu hỏi không tồn tại.");
        }
        
        List<Question> questions = questionRepository.findByQuestionBankIdOrderByOrderIndexAscIdAsc(bankId);
        return questions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết một câu hỏi theo ID.
     */
    @Transactional(readOnly = true)
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi với ID: " + id));
        return mapToDTO(question);
    }

    /**
     * Tạo mới một câu hỏi.
     */
    @Transactional
    public QuestionDTO createQuestion(QuestionDTO dto, String username) {
        QuestionBank bank = questionBankRepository.findById(dto.getQuestionBankId())
                .orElseThrow(() -> new IllegalArgumentException("Ngân hàng câu hỏi không tồn tại."));

        // Kiểm tra quyền sở hữu
        if (!bank.getTeacher().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền thêm câu hỏi vào ngân hàng câu hỏi này.");
        }

        // Lấy max order index hiện tại
        Integer maxOrder = questionRepository.findMaxOrderIndexByBankId(bank.getId());

        Question question = Question.builder()
                .questionBank(bank)
                .type(dto.getType())
                .content(dto.getContent())
                .metadata(dto.getMetadata())
                .orderIndex(maxOrder != null ? maxOrder + 1 : 1)
                .build();

        Question savedQuestion = questionRepository.save(question);
        return mapToDTO(savedQuestion);
    }

    /**
     * Cập nhật câu hỏi.
     */
    @Transactional
    public QuestionDTO updateQuestion(Long id, QuestionDTO dto, String username) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi với ID: " + id));

        QuestionBank bank = question.getQuestionBank();

        // Kiểm tra quyền sở hữu ngân hàng câu hỏi chứa câu hỏi này
        if (!bank.getTeacher().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền sửa câu hỏi trong ngân hàng câu hỏi này.");
        }

        // Cập nhật thông tin (Chỉ cho phép cập nhật type, content, và metadata)
        // Lưu ý: Không cho phép đổi bankId của câu hỏi sang bank khác (nếu cần thì sẽ thêm logic sau)
        question.setType(dto.getType());
        question.setContent(dto.getContent());
        question.setMetadata(dto.getMetadata());

        Question updatedQuestion = questionRepository.save(question);
        return mapToDTO(updatedQuestion);
    }

    /**
     * Xóa câu hỏi.
     */
    @Transactional
    public void deleteQuestion(Long id, String username) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi với ID: " + id));

        QuestionBank bank = question.getQuestionBank();

        // Kiểm tra quyền sở hữu
        if (!bank.getTeacher().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền xóa câu hỏi trong ngân hàng câu hỏi này.");
        }

        questionRepository.delete(question);
    }

    /**
     * Cập nhật hàng loạt thứ tự câu hỏi (Kéo thả).
     */
    @Transactional
    public void reorderQuestions(Long bankId, List<QuestionOrderUpdateDto> updates, String username) {
        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() -> new IllegalArgumentException("Ngân hàng câu hỏi không tồn tại."));

        if (!bank.getTeacher().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền sắp xếp lại câu hỏi trong ngân hàng này.");
        }

        List<Question> questions = questionRepository.findByQuestionBankIdOrderByOrderIndexAscIdAsc(bankId);
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        for (QuestionOrderUpdateDto update : updates) {
            Question q = questionMap.get(update.getId());
            if (q != null) {
                q.setOrderIndex(update.getOrderIndex());
            }
        }
        
        questionRepository.saveAll(questions);
    }

    /**
     * Hàm tiện ích map Entity sang DTO.
     */
    private QuestionDTO mapToDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .questionBankId(question.getQuestionBank().getId())
                .type(question.getType())
                .content(question.getContent())
                .metadata(question.getMetadata())
                .orderIndex(question.getOrderIndex())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
