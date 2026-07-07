package vn.edu.hust.quizflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hust.quizflow.dto.request.ClassroomCreateRequest;
import vn.edu.hust.quizflow.dto.request.ClassroomUpdateRequest;
import vn.edu.hust.quizflow.dto.response.ClassroomResponse;
import vn.edu.hust.quizflow.entity.ClassMember;
import vn.edu.hust.quizflow.entity.Classroom;
import vn.edu.hust.quizflow.entity.User;
import vn.edu.hust.quizflow.entity.UserRole;
import vn.edu.hust.quizflow.repository.ClassMemberRepository;
import vn.edu.hust.quizflow.repository.ClassroomRepository;
import vn.edu.hust.quizflow.repository.UserRepository;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {
    private final ClassroomRepository classroomRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRepository userRepository;
    private final vn.edu.hust.quizflow.repository.ClassChatStateRepository classChatStateRepository;

    @Transactional
    public ClassroomResponse createClassroom(ClassroomCreateRequest request, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên"));
        
        if (teacher.getRole() != UserRole.TEACHER) {
            throw new IllegalArgumentException("Chỉ giáo viên mới được tạo lớp");
        }

        String code;
        do {
            code = generateRandomCode(6);
        } while (classroomRepository.existsByCode(code));

        Classroom classroom = Classroom.builder()
                .name(request.getName())
                .code(code)
                .teacher(teacher)
                .build();
        
        Classroom saved = classroomRepository.save(classroom);
        return mapToResponse(saved, 0, 0);
    }

    @Transactional
    public ClassroomResponse joinClassroom(String code, String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh"));

        Classroom classroom = classroomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Mã lớp không hợp lệ hoặc lớp không tồn tại"));

        boolean alreadyJoined = classMemberRepository.existsByClassroomIdAndStudentId(classroom.getId(), student.getId());
        if (alreadyJoined) {
            throw new IllegalArgumentException("Bạn đã tham gia lớp học này rồi");
        }

        ClassMember member = ClassMember.builder()
                .classroom(classroom)
                .student(student)
                .build();
        classMemberRepository.save(member);

        long count = classMemberRepository.findByClassroomId(classroom.getId()).size();
        return mapToResponse(classroom, count, 0);
    }

    public List<ClassroomResponse> getMyClassrooms(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        if (user.getRole() == UserRole.TEACHER) {
            return classroomRepository.findByTeacherId(user.getId()).stream()
                    .filter(c -> c.getStatus() != vn.edu.hust.quizflow.entity.ClassroomStatus.ARCHIVED)
                    .map(c -> {
                        int unread = classChatStateRepository.findByUserIdAndClassroomId(user.getId(), c.getId())
                                .map(vn.edu.hust.quizflow.entity.ClassChatState::getUnreadCount)
                                .orElse(0);
                        return mapToResponse(c, classMemberRepository.findByClassroomId(c.getId()).size(), unread);
                    })
                    .collect(Collectors.toList());
        } else {
            return classMemberRepository.findByStudentId(user.getId()).stream()
                    .map(ClassMember::getClassroom)
                    .filter(c -> c.getStatus() != vn.edu.hust.quizflow.entity.ClassroomStatus.ARCHIVED)
                    .map(c -> {
                        int unread = classChatStateRepository.findByUserIdAndClassroomId(user.getId(), c.getId())
                                .map(vn.edu.hust.quizflow.entity.ClassChatState::getUnreadCount)
                                .orElse(0);
                        return mapToResponse(c, classMemberRepository.findByClassroomId(c.getId()).size(), unread);
                    })
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public ClassroomResponse updateClass(Long classId, ClassroomUpdateRequest request, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên"));

        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));

        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa lớp này");
        }

        if (classroom.getStatus() == vn.edu.hust.quizflow.entity.ClassroomStatus.ARCHIVED) {
            throw new IllegalArgumentException("Không thể sửa lớp học đã bị xóa/lưu trữ");
        }

        classroom.setName(request.getName());
        Classroom saved = classroomRepository.save(classroom);
        
        long count = classMemberRepository.findByClassroomId(classroom.getId()).size();
        return mapToResponse(saved, count, 0); // Assuming no unread messages needed when updating
    }

    @Transactional
    public void deleteClass(Long classId, String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên"));

        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học"));

        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa lớp này");
        }

        classroom.setStatus(vn.edu.hust.quizflow.entity.ClassroomStatus.ARCHIVED);
        classroomRepository.save(classroom);
    }

    private String generateRandomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private ClassroomResponse mapToResponse(Classroom classroom, long memberCount, int unreadCount) {
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .name(classroom.getName())
                .code(classroom.getCode())
                .teacherName(classroom.getTeacher().getFullName())
                .status(classroom.getStatus())
                .createdAt(classroom.getCreatedAt())
                .memberCount(memberCount)
                .unreadMessageCount(unreadCount)
                .build();
    }
}
