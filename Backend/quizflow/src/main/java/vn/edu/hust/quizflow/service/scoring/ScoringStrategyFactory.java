package vn.edu.hust.quizflow.service.scoring;

import org.springframework.stereotype.Component;
import vn.edu.hust.quizflow.entity.QuestionType;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Lớp Nhà máy (Factory) chịu trách nhiệm cung cấp công cụ chấm điểm phù hợp cho từng loại câu hỏi.
 * Kết hợp hoàn hảo giữa Factory Pattern và Strategy Pattern.
 */
@Component
public class ScoringStrategyFactory {

    // Kho chứa (Cache) các công cụ chấm điểm. 
    // Dùng EnumMap thay cho HashMap vì tốc độ truy xuất của EnumMap nhanh hơn rất nhiều khi Key là Enum.
    private final Map<QuestionType, ScoringStrategy> strategies;

    /**
     * Sức mạnh của Spring Boot DI (Dependency Injection) nằm ở đây.
     * Khi khởi động, Spring sẽ tự động tìm toàn bộ các Class nào có implements interface `ScoringStrategy`
     * (như SingleChoiceScoringStrategy, FillInTheBlank...) và gom hết chúng vào một `List` rồi bơm vào hàm này.
     */
    public ScoringStrategyFactory(List<ScoringStrategy> strategyList) {
        strategies = new EnumMap<>(QuestionType.class);
        
        // Factory chạy vòng lặp, "hỏi" từng cái Strategy xem nó chuyên trị loại câu hỏi nào (getSupportedType).
        // Sau đó cất vào tủ đồ (Map) theo đúng nhãn dán đó.
        for (ScoringStrategy strategy : strategyList) {
            strategies.put(strategy.getSupportedType(), strategy);
        }
    }

    /**
     * Hàm lấy công cụ chấm điểm.
     * Nhờ có Factory này, code chấm điểm chính (Score Engine) KHÔNG CẦN viết hàng chục dòng IF-ELSE hay SWITCH-CASE.
     * Cứ quăng loại câu hỏi vào (VD: FILL), Factory sẽ nhặt đúng cây kéo cắt (FillInTheBlankScoringStrategy) đưa ra cho bạn.
     */
    public ScoringStrategy getStrategy(QuestionType type) {
        ScoringStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("Không tìm thấy chiến lược chấm điểm cho loại câu hỏi: " + type);
        }
        return strategy;
    }
}
