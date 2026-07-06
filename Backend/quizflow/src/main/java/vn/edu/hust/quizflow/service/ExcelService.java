package vn.edu.hust.quizflow.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hust.quizflow.entity.Question;
import vn.edu.hust.quizflow.entity.QuestionBank;
import vn.edu.hust.quizflow.entity.QuestionType;
import vn.edu.hust.quizflow.repository.QuestionBankRepository;
import vn.edu.hust.quizflow.repository.QuestionRepository;
import vn.edu.hust.quizflow.dto.ReportSessionDetailDTO;
import vn.edu.hust.quizflow.dto.ScoreboardEntryDTO;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service // Đánh dấu đây là một Spring Service (chứa logic nghiệp vụ)
public class ExcelService {

    private final QuestionBankRepository questionBankRepository;
    private final QuestionRepository questionRepository;

    // Sử dụng Constructor Injection để Spring tự động tiêm (inject) các Repository vào
    public ExcelService(QuestionBankRepository questionBankRepository, QuestionRepository questionRepository) {
        this.questionBankRepository = questionBankRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional // Đảm bảo mọi thao tác lưu trữ DB trong hàm này đều an toàn (Rollback nếu có lỗi)
    public void importQuestionsFromExcel(Long bankId, MultipartFile file, String username) throws IOException {
        // 1. Tìm ngân hàng câu hỏi dựa trên ID
        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Ngân hàng câu hỏi"));

        // 2. Kiểm tra quyền truy cập: Chỉ giáo viên sở hữu mới được phép thêm câu hỏi
        if (!bank.getTeacher().getUsername().equals(username)) {
            throw new IllegalArgumentException("Bạn không có quyền thêm câu hỏi vào ngân hàng này");
        }

        // Khởi tạo danh sách tạm để chứa các câu hỏi đọc được từ Excel
        List<Question> questions = new ArrayList<>();

        // Sử dụng try-with-resources để tự động đóng luồng đọc file sau khi xử lý xong
        // Chuyển đổi file upload thành đối tượng Workbook dạng .xlsx trong bộ nhớ
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            // Lấy trang tính (sheet) đầu tiên để bắt đầu đọc dữ liệu
            Sheet sheet = workbook.getSheetAt(0);

            // Bỏ qua dòng tiêu đề (row 0), bắt đầu đọc từ dòng thứ 2 (index 1)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                // Nếu dòng hiện tại trống hoàn toàn thì bỏ qua
                if (row == null || isRowEmpty(row)) continue;

                try {
                    // Lấy loại câu hỏi ở cột A (index 0) và chuyển thành Enum
                    String typeStr = getCellValue(row.getCell(0)).toUpperCase();
                    QuestionType type = QuestionType.valueOf(typeStr);

                    // Đọc độ khó ở cột B (index 1). Nếu trống thì mặc định là 1.
                    // Sử dụng Double.parseDouble để tránh lỗi khi đọc số thực dạng 2.0 từ Excel, sau đó ép về int
                    String difficultyStr = getCellValue(row.getCell(1));
                    int difficulty = difficultyStr.isEmpty() ? 1 : (int) Double.parseDouble(difficultyStr);

                    // Đọc nội dung câu hỏi ở cột C (index 2)
                    String content = getCellValue(row.getCell(2));
                    if (content.isEmpty()) {
                        throw new IllegalArgumentException("Nội dung câu hỏi không được để trống");
                    }

                    // Khởi tạo cấu trúc metadata để lưu dữ liệu động của câu hỏi
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("difficulty", difficulty);

                    // Xử lý riêng cho câu hỏi Điền khuyết (FILL)
                    if (type == QuestionType.FILL) {
                        // Lấy đáp án đúng ở cột H (index 7)
                        String correctAnswer = getCellValue(row.getCell(7));
                        if (correctAnswer.isEmpty()) {
                            throw new IllegalArgumentException("Câu hỏi điền khuyết phải có đáp án đúng ở cột H");
                        }
                        metadata.put("options", new ArrayList<>()); // Câu điền khuyết không có các phương án lựa chọn
                        // Đưa chuỗi đáp án vào List để đồng bộ cấu trúc dữ liệu với các loại câu hỏi khác
                        metadata.put("correctAnswers", Collections.singletonList(correctAnswer));
                    } else {
                        // Xử lý cho câu hỏi Trắc nghiệm (SINGLE hoặc MULTIPLE)
                        List<Map<String, Object>> options = new ArrayList<>();
                        List<Integer> correctAnswers = new ArrayList<>();

                        // Đọc 4 phương án A, B, C, D từ các cột D, E, F, G (index 3, 4, 5, 6)
                        String[] optionCells = {
                                getCellValue(row.getCell(3)), // Đáp án A
                                getCellValue(row.getCell(4)), // Đáp án B
                                getCellValue(row.getCell(5)), // Đáp án C
                                getCellValue(row.getCell(6))  // Đáp án D
                        };

                        // Đọc cột H để biết đáp án đúng (ví dụ: "A" hoặc "A, B")
                        String correctStr = getCellValue(row.getCell(7)).toUpperCase(); 
                        // Tách chuỗi đáp án thành mảng các ký tự (ví dụ ["A", "B"])
                        List<String> correctLetters = Arrays.asList(correctStr.split("[,\\s]+"));

                        char letter = 'A';
                        int optionId = 1;
                        // Duyệt qua từng ô phương án đã đọc
                        for (String optText : optionCells) {
                            if (!optText.isEmpty()) { // Nếu phương án có nội dung
                                // Khởi tạo một Map để lưu ID và Text của phương án
                                Map<String, Object> optMap = new HashMap<>();
                                optMap.put("id", optionId);
                                optMap.put("text", optText);
                                options.add(optMap);

                                // Kiểm tra xem phương án hiện tại (A, B, C, D) có nằm trong danh sách đáp án đúng không
                                if (correctLetters.contains(String.valueOf(letter))) {
                                    correctAnswers.add(optionId); // Nếu có, lưu ID của nó vào mảng đáp án đúng
                                }
                                optionId++;
                            }
                            letter++; // Chuyển sang chữ cái tiếp theo (A -> B -> C -> D)
                        }

                        // Ràng buộc tính hợp lệ
                        if (options.isEmpty()) {
                            throw new IllegalArgumentException("Câu hỏi trắc nghiệm phải có ít nhất 1 đáp án");
                        }
                        if (correctAnswers.isEmpty()) {
                            throw new IllegalArgumentException("Phải chỉ định ít nhất 1 đáp án đúng ở cột H (VD: A, B, C)");
                        }

                        // Đẩy danh sách lựa chọn và đáp án đúng vào metadata
                        metadata.put("options", options);
                        metadata.put("correctAnswers", correctAnswers);
                    }

                    // Sử dụng Builder pattern để tạo đối tượng Question
                    Question q = Question.builder()
                            .questionBank(bank)
                            .type(type)
                            .content(content)
                            .metadata(metadata)
                            .build();

                    // Thêm vào danh sách tạm
                    questions.add(q);

                } catch (Exception e) {
                    // Nếu lỗi xảy ra ở bất kỳ cột nào của một dòng, bắt lại và thông báo chính xác dòng bị lỗi (dòng i + 1 để khớp với giao diện Excel)
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": " + e.getMessage());
                }
            }
        }

        // Kiểm tra sau khi quét toàn bộ file
        if (questions.isEmpty()) {
            throw new IllegalArgumentException("File Excel không có dữ liệu câu hỏi hợp lệ");
        }

        // Lưu toàn bộ câu hỏi hợp lệ vào Cơ sở dữ liệu
        questionRepository.saveAll(questions);
    }

    public byte[] exportQuestionsToExcel(Long bankId) throws IOException {
        // Kiểm tra bank
        if (!questionBankRepository.existsById(bankId)) {
            throw new IllegalArgumentException("Ngân hàng câu hỏi không tồn tại.");
        }

        // Truy vấn danh sách câu hỏi thuộc ngân hàng chỉ định
        List<Question> questions = questionRepository.findByQuestionBankIdOrderByOrderIndexAscIdAsc(bankId);

        // Khởi tạo Workbook và OutputStream để tạo file dạng bộ nhớ (byte array)
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Questions"); // Tạo trang tính tên "Questions"

            // 1. Khởi tạo định dạng (Style) cho dòng tiêu đề (Header)
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex()); // Nền xám
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true); // Chữ in đậm
            headerStyle.setFont(headerFont);

            // 2. Ghi dòng tiêu đề
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Loại CH", "Mức độ", "Nội dung câu hỏi", "Đáp án 1 (A)", "Đáp án 2 (B)", "Đáp án 3 (C)", "Đáp án 4 (D)", "Đáp án đúng"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]); // Gán nội dung
                cell.setCellStyle(headerStyle); // Áp dụng Style
            }

            // 3. Ghi dữ liệu câu hỏi từ CSDL ra Excel
            int rowIdx = 1;
            for (Question q : questions) {
                Row row = sheet.createRow(rowIdx++);
                
                // Cột A: Loại câu hỏi
                row.createCell(0).setCellValue(q.getType().name());

                // Cột B: Độ khó
                Map<String, Object> meta = q.getMetadata();
                int difficulty = meta.containsKey("difficulty") ? (int) meta.get("difficulty") : 1;
                row.createCell(1).setCellValue(difficulty);

                // Cột C: Nội dung câu hỏi
                row.createCell(2).setCellValue(q.getContent());

                // Ghi các tùy chọn và đáp án đúng
                if (q.getType() == QuestionType.FILL) {
                    // Loại Điền khuyết: Lấy đáp án đúng đầu tiên và ghi thẳng vào cột H
                    List<?> corrects = (List<?>) meta.get("correctAnswers");
                    if (corrects != null && !corrects.isEmpty()) {
                        row.createCell(7).setCellValue(corrects.get(0).toString());
                    }
                } else {
                    // Loại Trắc nghiệm: Ghi 4 lựa chọn ra các cột D, E, F, G và gom các đáp án đúng ra cột H
                    List<Map<String, Object>> options = (List<Map<String, Object>>) meta.get("options");
                    List<?> correctIds = (List<?>) meta.get("correctAnswers");

                    StringBuilder correctStr = new StringBuilder();
                    if (options != null) {
                        for (int i = 0; i < options.size() && i < 4; i++) {
                            Map<String, Object> opt = options.get(i);
                            String optIdStr = String.valueOf(opt.get("id"));
                            
                            // Ghi nội dung phương án
                            row.createCell(3 + i).setCellValue((String) opt.get("text"));

                            // Dò xem phương án này có phải đáp án đúng không một cách an toàn (tránh ClassCastException giữa Integer và Long)
                            boolean isCorrect = false;
                            if (correctIds != null) {
                                for (Object cId : correctIds) {
                                    if (String.valueOf(cId).equals(optIdStr)) {
                                        isCorrect = true;
                                        break;
                                    }
                                }
                            }

                            if (isCorrect) {
                                if (correctStr.length() > 0) correctStr.append(",");
                                // Quy đổi index 0, 1, 2, 3 thành 'A', 'B', 'C', 'D'
                                correctStr.append((char) ('A' + i));
                            }
                        }
                    }
                    // Ghi chuỗi đáp án cuối cùng vào cột H
                    row.createCell(7).setCellValue(correctStr.toString());
                }
            }

            // Tự động điều chỉnh độ rộng của các cột cho vừa với chữ
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Ghi nội dung Workbook vào ByteArrayOutputStream
            workbook.write(out);
            return out.toByteArray(); // Trả về dạng mảng byte để Spring Framework gửi qua HTTP Response
        }
    }

    /**
     * Hàm trợ giúp kiểm tra xem một dòng Excel có trống hoàn toàn hay không.
     * Bằng cách kiểm tra toàn bộ các ô trong dòng, nếu có ô khác khoảng trắng/BLANK thì trả về false.
     */
    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    /**
     * Hàm trợ giúp đọc giá trị của ô Excel một cách an toàn.
     * Tự động nhận dạng kiểu dữ liệu (Số, Chữ, Boolean) để lấy đúng giá trị mà không ném lỗi.
     */
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim(); // Xóa khoảng trắng thừa
            case NUMERIC:
                double val = cell.getNumericCellValue();
                // Nếu số không có phần thập phân thì chuyển về số nguyên, tránh lỗi hiển thị VD "2.0"
                if (val == (long) val) {
                    return String.valueOf((long) val);
                }
                return String.valueOf(val);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return ""; // Các trường hợp lỗi hoặc trống trả về chuỗi rỗng
        }
    }

    /**
     * Xuất bảng điểm của một ca thi ra file Excel.
     */
    public byte[] exportScoreboardToExcel(ReportSessionDetailDTO sessionDetail) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bảng Điểm");

            // Tạo Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Xếp hạng", "Họ và tên", "Bắt đầu", "Nộp bài", "Thời gian làm", "Trạng thái", "Điểm"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Ghi dữ liệu
            int rowIdx = 1;
            for (ScoreboardEntryDTO entry : sessionDetail.getScoreboard()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(entry.getRank());
                row.createCell(1).setCellValue(entry.getName());
                row.createCell(2).setCellValue(entry.getStartedAt());
                row.createCell(3).setCellValue(entry.getSubmittedAt());
                row.createCell(4).setCellValue(entry.getTimeTaken());
                row.createCell(5).setCellValue(entry.getCheatFlag());
                row.createCell(6).setCellValue(entry.getScore());
            }

            // Auto-size các cột để vừa với nội dung
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
