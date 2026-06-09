package vn.edu.hust.quizflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) dùng để nhận dữ liệu câu trả lời từ Frontend gửi
 * lên Server.
 * Dữ liệu được gửi qua kết nối WebSocket (MessageBroker) chứ không phải HTTP
 * thông thường.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswerRequest {
    // ID của ca thi (phòng thi) mà học sinh đang làm bài
    private Long sessionId;

    // ID của câu hỏi trong Database (Primary Key)
    // KHÔNG phải là số thứ tự hiển thị (1, 2, 3...)
    private Long questionId;

    // Dữ liệu đáp án học sinh vừa chọn. Kiểu Object vì nó có thể chứa nhiều loại
    // định dạng khác nhau:
    // 1. Nếu là dạng điền từ (Fill in Blank): Nó là kiểu String (ví dụ: "Thủ đô Hà
    // Nội").
    // 2. Nếu là Trắc nghiệm 1 đáp án / Nhiều đáp án: Nó là danh sách các "Option
    // ID".
    //
    // Trả lời thắc mắc về Option ID lớn/nhỏ:
    // - Khi giáo viên nhập câu hỏi bằng tay trên Web: Frontend dùng `Date.now()`
    // (như 1716584213123)
    // để sinh ID tạm cho Option nhằm chống trùng lặp State trong React (tránh lỗi
    // key).
    // - Khi giáo viên import bằng Excel: Backend tự sinh số thứ tự (1, 2, 3, 4).
    // => Dù ID là số siêu lớn hay số nhỏ 1,2,3, thì bản chất nó chỉ là cái Nhãn
    // (Label ID)
    // để chọc đúng vào Metadata kiểm tra xem nhãn đó có nằm trong mảng
    // `correctAnswers` hay không.
    private Object answerData;
}
