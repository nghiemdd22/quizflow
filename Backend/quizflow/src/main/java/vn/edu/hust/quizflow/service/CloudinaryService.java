package vn.edu.hust.quizflow.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public Map uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Đặt tên ngẫu nhiên tránh trùng lặp
        String publicId = UUID.randomUUID().toString();
        String contentType = file.getContentType();
        String resourceType = "auto";
        if (contentType != null && !contentType.startsWith("image/") && !contentType.startsWith("video/")) {
            resourceType = "raw";
            // Đối với file raw, Cloudinary có thể cần extension trong public_id để trả về đúng định dạng
            if (!extension.isEmpty()) {
                publicId = publicId + extension;
            }
        }
        
        return cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "resource_type", resourceType
                ));
    }
}
