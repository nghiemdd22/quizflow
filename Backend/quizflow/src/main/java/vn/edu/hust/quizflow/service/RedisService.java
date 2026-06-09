package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {

    // Tiêm RedisTemplate đã được cấu hình ở RedisConfig.java vào đây để sử dụng
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Tạo khóa (Key) duy nhất để lưu đáp án của một học sinh trong một phòng thi.
     * Áp dụng quy tắc đặt tên chuẩn của Redis (dùng dấu hai chấm ':' làm namespace).
     * Ví dụ: exam_session:5:student:120 (Bài làm của học sinh ID 120 trong phòng thi ID 5)
     * Nhờ cách đặt tên này, ta có thể dễ dàng quản lý và tránh bị trùng lặp dữ liệu giữa các phòng/học sinh.
     */
    private String getAnswerKey(Long sessionId, Long studentId) {
        return String.format("exam_session:%d:student:%d", sessionId, studentId);
    }

    /**
     * Lưu một cú click chọn đáp án của học sinh vào RAM (Redis).
     * Sử dụng cấu trúc dữ liệu Redis Hash (Giống như Map<String, Object> trong Java).
     * Với cấu trúc Hash này, ta có thể lưu và cập nhật từng câu hỏi riêng biệt (ví dụ đổi đáp án câu 1 từ A sang B)
     * mà không cần phải ghi đè lại toàn bộ bài làm của học sinh. Tốc độ thực thi cực kỳ nhanh (O(1)).
     *
     * @param questionId ID của câu hỏi học sinh vừa làm
     * @param answerData Dữ liệu đáp án (Có thể là String, List<Long>...)
     */
    public void saveAnswer(Long sessionId, Long studentId, Long questionId, Object answerData) {
        String key = getAnswerKey(sessionId, studentId);
        
        // Dùng lệnh HSET (put) để cập nhật đáp án cho đúng câu hỏi đó
        redisTemplate.opsForHash().put(key, questionId.toString(), answerData);
        
        // Đặt TTL (Time-to-live) là 24 giờ.
        // Ý nghĩa: Đề phòng trường hợp học sinh rớt mạng không bao giờ quay lại nộp bài,
        // hệ thống sẽ tự động dọn rác (xóa dữ liệu này khỏi RAM) sau 24h để giải phóng bộ nhớ.
        redisTemplate.expire(key, 24, TimeUnit.HOURS);
    }

    /**
     * Lấy toàn bộ bài làm (tất cả các câu đã đánh) của học sinh từ Redis.
     * Dùng lệnh HGETALL. Được gọi khi:
     * 1. Học sinh bấm F5, tải lại trang và cần khôi phục lại các ô đã tick trên màn hình.
     * 2. Học sinh bấm "Nộp bài", Backend cần gom toàn bộ đáp án lại để mang đi chấm điểm.
     */
    public Map<Object, Object> getStudentAnswers(Long sessionId, Long studentId) {
        String key = getAnswerKey(sessionId, studentId);
        // Lấy tất cả các cặp (Câu hỏi - Đáp án) trong Hash
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * Dọn dẹp sạch sẽ dữ liệu bài làm của học sinh khỏi RAM (Redis).
     * Hàm này bắt buộc phải được gọi NGAY SAU KHI hệ thống đã chấm điểm xong
     * và lưu kết quả cuối cùng vào Database (MySQL), để tiết kiệm tài nguyên Server.
     */
    public void clearStudentAnswers(Long sessionId, Long studentId) {
        String key = getAnswerKey(sessionId, studentId);
        redisTemplate.delete(key);
    }
}
