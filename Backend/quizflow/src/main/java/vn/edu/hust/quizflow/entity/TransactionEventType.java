package vn.edu.hust.quizflow.entity;

/**
 * Định nghĩa danh sách các loại sự kiện (Event Types) cho các tiến trình xử lý bất đồng bộ.
 * Việc sử dụng Enum thay vì String giúp tránh lỗi gõ sai chính tả (typo) và dễ dàng quản lý, mở rộng.
 */
public enum TransactionEventType {
    /**
     * Sự kiện chấm điểm bài thi.
     */
    EXAM_GRADING,
    
    /**
     * (Dự phòng cho tương lai) Sự kiện tạo chứng chỉ sau khi thi đỗ.
     */
    CERTIFICATE_GENERATION,
    
    /**
     * (Dự phòng cho tương lai) Sự kiện gửi email thông báo kết quả.
     */
    EMAIL_NOTIFICATION
}
