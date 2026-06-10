package vn.edu.hust.quizflow.entity;

/**
 * Các trạng thái vòng đời của một bài thi trong luồng xử lý bất đồng bộ.
 */
public enum SubmissionStatus {
    IN_PROGRESS, // Đang làm bài (Ngay khi học sinh vào phòng thi)
    GRADING,     // Đang chấm điểm / Đang chờ xử lý (Học sinh nộp bài hoặc bị CronJob ép thu bài)
    COMPLETED,   // Hoàn tất / Đã có điểm (Background Worker chấm điểm thành công)
    FAILED       // Thất bại do sự cố (Worker gặp lỗi hệ thống khi chấm)
}
