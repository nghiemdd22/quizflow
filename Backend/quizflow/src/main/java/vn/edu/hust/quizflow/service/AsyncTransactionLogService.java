package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.entity.AsyncTransactionLog;
import vn.edu.hust.quizflow.repository.AsyncTransactionLogRepository;

/**
 * Service chuyên biệt để quản lý Audit Log của hệ thống.
 * Nhiệm vụ chính là đảm bảo việc ghi log luôn được thực hiện ở một Transaction độc lập
 * để không bị ảnh hưởng bởi tiến trình Rollback của các logic nghiệp vụ (như chấm điểm).
 */
@Service
@RequiredArgsConstructor
public class AsyncTransactionLogService {

    private final AsyncTransactionLogRepository repository;

    /**
     * Lưu Log vào Database bằng một Transaction mới hoàn toàn (REQUIRES_NEW).
     * Nếu hàm cha gọi nó bị lỗi và Rollback, Log này vẫn sẽ được giữ lại an toàn.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AsyncTransactionLog saveLog(AsyncTransactionLog logEntry) {
        return repository.save(logEntry);
    }
}
