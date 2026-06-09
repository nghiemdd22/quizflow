package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hust.quizflow.entity.SessionStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object (DTO) dùng để đóng gói và gửi toàn bộ thông tin phòng thi 
 * về cho Frontend ngay khi học sinh tham gia vào ca thi (join session).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamRoomResponse {
    
    // ID của ca thi (phòng thi) hiện tại
    private Long sessionId;
    
    // Tên của đề thi (hiển thị trên tiêu đề phòng thi của Frontend)
    private String examTitle;
    
    // Trạng thái của ca thi (Chỉ có 3 trạng thái: UPCOMING, ACTIVE, CLOSED)
    private SessionStatus status;
    
    // Thời điểm bắt đầu mở ca thi
    private LocalDateTime startTime;
    
    // Thời hạn nộp bài chính xác của riêng học sinh này (Đã được tính toán kỹ ở Backend)
    // Frontend sẽ dùng trường này để đếm ngược thời gian và tự động nộp bài khi hết giờ.
    private LocalDateTime endTime; 
    
    // Thời gian hiện tại của Server lúc gửi response.
    // Rất quan trọng: Frontend phải dùng giờ của Server để đồng bộ đồng hồ đếm ngược,
    // nhằm chống trường hợp học sinh chỉnh sửa đồng hồ trên máy tính cá nhân để gian lận thời gian làm bài.
    private LocalDateTime serverTime; 
    
    // Tổng số phút cho phép làm bài (Ví dụ: 45 phút)
    private int durationMinutes;
    
    // ID của tờ giấy thi (bản ghi ExamSubmission) của học sinh này trong DB.
    // Cần thiết để lưu log hoặc xử lý sự cố nộp bài sau này.
    private Long submissionId;
    
    // Danh sách toàn bộ các câu hỏi của đề thi đã được xáo trộn/sắp xếp 
    // và ĐÃ BỊ CHE ĐÁP ÁN (loại bỏ trường correctAnswers).
    private List<StudentQuestionDTO> questions;
}
