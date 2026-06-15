package vn.edu.hust.quizflow.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import vn.edu.hust.quizflow.security.JwtUtils;

import java.util.Collections;

/**
 * Lớp cấu hình cho WebSocket kết hợp với giao thức STOMP.
 * @Configuration đánh dấu lớp này là một phần cấu hình của Spring.
 * @EnableWebSocketMessageBroker kích hoạt tính năng xử lý tin nhắn qua WebSocket được hỗ trợ bởi một Message Broker (trạm trung chuyển).
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtils jwtUtils;

    /**
     * Cấu hình Message Broker - Nơi định tuyến các tin nhắn.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Kích hoạt một in-memory message broker (trạm trung chuyển tin nhắn lưu ngay trong bộ nhớ RAM).
        // Các tin nhắn gửi từ Server xuống Client sẽ mang tiền tố là "/topic" (ví dụ: "/topic/room/1") hoặc "/queue".
        // Frontend sẽ "subscribe" (đăng ký theo dõi) vào các đường dẫn bắt đầu bằng "/topic" hoặc "/user/queue" này để nhận tin nhắn.
        config.enableSimpleBroker("/topic", "/queue");
        
        // Đặt tiền tố cho các tin nhắn từ Client gửi ngược lên Server.
        // Những tin nhắn có tiền tố "/app" sẽ được tự động chuyển tới các phương thức được gắn @MessageMapping trong Controller để xử lý.
        // Ví dụ: Client gửi tin nhắn tới "/app/chat", tin nhắn sẽ chạy vào Controller có @MessageMapping("/chat").
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Đăng ký các endpoint cho WebSocket (điểm bắt đầu để kết nối).
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Khai báo một endpoint là "/ws/exam".
        // Khi Frontend (Client) muốn bắt đầu mở đường ống kết nối WebSocket, họ sẽ gửi request HTTP tới endpoint này.
        registry.addEndpoint("/ws/exam")
                // Cho phép Cross-Origin Request từ tất cả các domain (phòng tránh lỗi CORS khi Frontend chạy ở một port/domain khác gọi tới)
                .setAllowedOriginPatterns("*")
                // Sử dụng SockJS làm fallback option: Nếu trình duyệt của user cũ và không hỗ trợ WebSocket thuần, 
                // SockJS sẽ tự động chuyển sang các cơ chế khác (như HTTP long-polling) để đảm bảo ứng dụng vẫn hoạt động.
                .withSockJS();
    }

    /**
     * Cấu hình luồng dữ liệu (Channel) nhận tin nhắn từ Client gửi lên.
     * Ở đây, chúng ta thêm một bộ lọc (Interceptor) để xác thực người dùng bằng JWT Token
     * ngay tại thời điểm họ thiết lập kết nối STOMP. Đây là nơi trả lời cho câu hỏi "tại sao cho phép permitAll() ở SecurityConfig" - vì ta sẽ xác thực ở đây.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                // Chuyển đổi thông điệp thô thành StompHeaderAccessor để có thể đọc được các Header đặc thù của giao thức STOMP
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                // Kiểm tra xem đây có phải là gói tin CONNECT (gói tin đầu tiên khi Client muốn bắt tay giao thức STOMP) hay không
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Lấy giá trị của Header "Authorization" do Client chủ động gắn vào khi gửi gói tin STOMP CONNECT
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    // Nếu Header có tồn tại và bắt đầu bằng "Bearer "
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7); // Cắt bỏ chuỗi "Bearer " để trích xuất Token thật
                        
                        // Xác minh tính hợp lệ của JWT Token
                        if (jwtUtils.validateToken(token)) {
                            // Nếu hợp lệ, tiến hành giải mã Token để lấy username và role
                            String username = jwtUtils.getUsernameFromToken(token);
                            String role = jwtUtils.getRoleFromToken(token);
                            
                            // Tạo đối tượng xác thực (Authentication) chứa thông tin của User
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                    username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
                                    
                            // Gán đối tượng xác thực này vào phiên làm việc (Session) của kết nối STOMP hiện tại
                            // Nhờ đó, Spring Security sẽ nhận diện được Client ở đầu dây bên kia là ai trong suốt quá trình giữ kết nối
                            accessor.setUser(auth);
                        }
                    }
                }
                // Cuối cùng, cho phép gói tin tiếp tục được xử lý
                return message;
            }
        });
    }
}
