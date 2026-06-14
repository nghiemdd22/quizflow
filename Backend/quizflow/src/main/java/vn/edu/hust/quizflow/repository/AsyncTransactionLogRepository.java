package vn.edu.hust.quizflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hust.quizflow.entity.AsyncTransactionLog;
import vn.edu.hust.quizflow.entity.TransactionEventType;

import java.util.Optional;

/**
 * Repository thao tác với bảng async_transaction_logs trong cơ sở dữ liệu.
 * Đóng vai trò như một cuốn "Nhật ký hệ thống", ghi lại toàn bộ dấu vết (Audit Trail)
 * của các tiến trình xử lý ngầm (Ví dụ: Chấm điểm bài thi).
 * Đây là thành phần không thể thiếu để xây dựng cơ chế SAGA / Compensating Transactions.
 */
public interface AsyncTransactionLogRepository extends JpaRepository<AsyncTransactionLog, Long> {
    
    /**
     * Tìm kiếm một bản ghi Log cụ thể dựa trên ID của bài nộp và Loại sự kiện (Event Type).
     * Hàm này rất hữu ích khi hệ thống gặp sự cố và tiến trình Retry/Rollback thức dậy,
     * nó cần tìm lại đúng Log "EXAM_GRADING" của bài thi đó để phân tích tình hình.
     * 
     * @param submissionId ID của bài nộp (ExamSubmission)
     * @param eventType Loại sự kiện (VD: TransactionEventType.EXAM_GRADING)
     * @return Optional chứa thông tin Log nếu tìm thấy
     */
    Optional<AsyncTransactionLog> findBySubmissionIdAndEventType(Long submissionId, TransactionEventType eventType);
}
