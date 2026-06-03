package vn.edu.hust.quizflow.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Lớp chuyển đổi thuộc tính JPA (Attribute Converter) giúp tự động mã hóa/giải
 * mã các cột nhạy cảm.
 * Hibernate sẽ gọi lớp này trước khi lưu dữ liệu vào DB (mã hóa) và sau khi tải
 * dữ liệu từ DB (giải mã).
 */
@Converter
public class AesEncryptorConverter implements AttributeConverter<String, String> {

    /**
     * Chuyển đổi dữ liệu thuộc tính từ Entity (dạng text thuần) sang dạng lưu trữ
     * trong DB (đã mã hóa).
     */
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return EncryptionUtils.encrypt(attribute);
    }

    /**
     * Chuyển đổi dữ liệu từ cột DB (dạng mã hóa) sang dạng hiển thị trong Java
     * Entity (dạng text thuần).
     */
    @Override
    public String convertToEntityAttribute(String dbData) {
        return EncryptionUtils.decrypt(dbData);
    }
}
