package vn.edu.hust.quizflow.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Lớp tiện ích phục vụ mã hóa và giải mã đối xứng AES-256 (chế độ CBC, padding PKCS5).
 * Được sử dụng để bảo vệ thông tin nhạy cảm của người dùng (SĐT, CCCD) trước khi lưu xuống DB.
 */
@Component
public class EncryptionUtils {

    // Lấy khóa bí mật từ file cấu hình application.yaml, mặc định là chuỗi 32 ký tự nếu không cấu hình
    @Value("${encryption.secret-key:vdtprojectsecretkeyquizflow12345}")
    private String secretKey;

    // Lấy vector khởi tạo (IV) từ file cấu hình, mặc định là chuỗi 16 ký tự nếu không cấu hình
    @Value("${encryption.iv:quizflowdefaulti}")
    private String iv;

    // Các biến static dùng để chia sẻ khóa và IV cho phương thức static (sử dụng trong JPA Converter)
    private static String staticSecretKey;
    private static String staticIv;

    /**
     * Phương thức khởi tạo chạy sau khi Bean được Spring container quản lý,
     * gán giá trị từ biến non-static sang static để các hàm static sử dụng được.
     */
    @PostConstruct
    public void init() {
        staticSecretKey = this.secretKey;
        staticIv = this.iv;
    }

    /**
     * Mã hóa chuỗi văn bản thuần (plainText) sang chuỗi đã mã hóa dạng Base64.
     *
     * @param plainText chuỗi dữ liệu gốc cần mã hóa
     * @return chuỗi đã mã hóa dạng Base64
     */
    public static String encrypt(String plainText) {
        if (plainText == null) {
            return null;
        }
        try {
            // Khởi tạo Key Spec từ khóa bí mật
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    staticSecretKey.getBytes(StandardCharsets.UTF_8), "AES");
            // Khởi tạo IV Spec từ Vector khởi tạo
            IvParameterSpec ivParameterSpec = new IvParameterSpec(
                    staticIv.getBytes(StandardCharsets.UTF_8));

            // Sử dụng thuật toán AES với chế độ CBC và PKCS5Padding
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, ivParameterSpec);

            // Thực hiện mã hóa dữ liệu
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            // Trả về kết quả dưới dạng chuỗi mã hóa Base64
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xảy ra trong quá trình mã hóa AES", e);
        }
    }

    /**
     * Giải mã chuỗi văn bản đã mã hóa Base64 về dạng văn bản thuần gốc ban đầu.
     *
     * @param encryptedText chuỗi Base64 đã được mã hóa
     * @return chuỗi văn bản thuần ban đầu sau khi giải mã
     */
    public static String decrypt(String encryptedText) {
        if (encryptedText == null) {
            return null;
        }
        try {
            // Khởi tạo Key Spec từ khóa bí mật
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    staticSecretKey.getBytes(StandardCharsets.UTF_8), "AES");
            // Khởi tạo IV Spec từ Vector khởi tạo
            IvParameterSpec ivParameterSpec = new IvParameterSpec(
                    staticIv.getBytes(StandardCharsets.UTF_8));

            // Sử dụng thuật toán AES với chế độ CBC và PKCS5Padding
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParameterSpec);

            // Giải mã từ mảng byte sau khi giải mã chuỗi Base64
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            // Trả về chuỗi kết quả có định dạng UTF-8
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xảy ra trong quá trình giải mã AES", e);
        }
    }
}
