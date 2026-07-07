package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hust.quizflow.dto.AdminStatsDTO;
import vn.edu.hust.quizflow.dto.AdminUserDTO;
import vn.edu.hust.quizflow.dto.TeacherPinDTO;
import vn.edu.hust.quizflow.entity.TeacherPin;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.entity.UserRole;
import vn.edu.hust.quizflow.repository.ExamSessionRepository;
import vn.edu.hust.quizflow.repository.QuestionBankRepository;
import vn.edu.hust.quizflow.repository.TeacherPinRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TeacherPinRepository teacherPinRepository;
    private final ExamSessionRepository examSessionRepository;
    private final QuestionBankRepository questionBankRepository;

    public AdminStatsDTO getAdminStats() {
        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long totalTeachers = userRepository.countByRole(UserRole.TEACHER);
        long totalQuestionBanks = questionBankRepository.count();
        long totalSessions = examSessionRepository.count();
        long activeSessions = examSessionRepository.countByStatus(vn.edu.hust.quizflow.entity.SessionStatus.ACTIVE);

        return AdminStatsDTO.builder()
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .totalQuestionBanks(totalQuestionBanks)
                .totalSessions(totalSessions)
                .activeSessions(activeSessions)
                .build();
    }

    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(u -> AdminUserDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .role(u.getRole())
                .isActive(u.isActive())
                .createdAt(u.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getRole() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Không thể khóa tài khoản Admin!");
        }
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    public List<TeacherPinDTO> getAllPins() {
        return teacherPinRepository.findAll().stream().map(pin -> {
            String usedBy = pin.getUsedBy() != null ? pin.getUsedBy().getUsername() : null;
            String createdBy = userRepository.findById(pin.getCreatedBy()).map(User::getUsername).orElse("Unknown");
            return TeacherPinDTO.builder()
                    .id(pin.getId())
                    .pinCode(pin.getPinCode())
                    .isUsed(pin.isUsed())
                    .isActive(pin.isActive())
                    .createdAt(pin.getCreatedAt())
                    .usedAt(pin.getUsedAt())
                    .usedByUsername(usedBy)
                    .createdByUsername(createdBy)
                    .build();
        }).collect(Collectors.toList());
    }

    public TeacherPinDTO createPin(String username) {
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Admin"));
        
        // Tạo một mã PIN gồm 8 ký tự
        String newCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        TeacherPin pin = TeacherPin.builder()
                .pinCode(newCode)
                .isUsed(false)
                .isActive(true)
                .createdBy(admin.getId())
                .build();
        pin = teacherPinRepository.save(pin);
        return TeacherPinDTO.builder()
                .id(pin.getId())
                .pinCode(pin.getPinCode())
                .isUsed(pin.isUsed())
                .isActive(pin.isActive())
                .createdAt(pin.getCreatedAt())
                .build();
    }

    public void togglePinStatus(Long pinId) {
        TeacherPin pin = teacherPinRepository.findById(pinId).orElseThrow();
        if (pin.isUsed()) {
            throw new IllegalArgumentException("Không thể vô hiệu hóa mã PIN đã được sử dụng!");
        }
        pin.setActive(!pin.isActive());
        teacherPinRepository.save(pin);
    }
}
