package vn.edu.hust.quizflow.entity;

/**
 * Trạng thái của một tiến trình bất đồng bộ (Async Transaction Log).
 * Phục vụ cho cơ chế SAGA Pattern / Compensating Transactions nhằm đảm bảo
 * tính nhất quán dữ liệu (Data Consistency) giữa các service khi xảy ra lỗi hệ
 * thống.
 */
public enum TransactionLogStatus {
    /**
     * Đang chờ hoặc đang xử lý.
     * (Ví dụ: Worker bắt đầu bốc Message nộp bài ra để chấm điểm).
     */
    PENDING,

    /**
     * Đã xử lý thành công.
     * (Ví dụ: Worker đã chấm xong và lưu toàn bộ kết quả xuống MySQL thành công).
     */
    SUCCESS,

    /**
     * Xử lý thất bại.
     * (Ví dụ: Đang chấm điểm thì Database sập). Cần có cơ chế xử lý lại (Retry)
     * hoặc bù trừ (Compensate).
     */
    FAILED,

    /**
     * Bắt đầu tiến trình bù trừ/hủy bỏ (Rollback).
     * (Ví dụ: Xóa đi những điểm số đã bị lưu dở dang trước khi sập Database để dữ
     * liệu không bị rác).
     */
    ROLLBACK_INITIATED,

    /**
     * Đã Rollback thành công.
     * Hệ thống đã dọn dẹp xong lỗi và trở về trạng thái an toàn (Consistent State).
     */
    ROLLBACK_COMPLETED
}
