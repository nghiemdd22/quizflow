# Hướng Dẫn Tích Hợp & Phát Triển LearnHub (Neo-Brutalism Style)

Dự án này là trang chủ nền tảng giáo dục **LearnHub** được thiết kế theo phong cách thịnh hành **Neo-Brutalism** (viền đen dày, bóng đổ phẳng góc cạnh, màu sắc tương phản nổi bật trên nền kem ấm áp). 

Mã nguồn được tổ chức sạch sẽ, chú thích rõ ràng để lập trình viên dễ dàng mở rộng và tích hợp các tính năng JavaScript/CSS hoặc kết nối với API Backend.

---

## 🎨 1. Hệ Thống CSS & Các Class Neo-Brutalism

Các lớp CSS phong cách Neo-brutalism được định nghĩa tại file [src/index.css](file:///d:/test-fe/src/index.css). Dưới đây là mô tả chi tiết:

### Các Biến Màu Sắc Custom (Tailwind v4 `@theme`)
Chúng tôi sử dụng cấu hình theme mới của Tailwind v4 để đăng ký các màu sắc đặc trưng:
*   `bg-neo-bg` (`#fbfbf8`): Màu nền kem nhẹ nhàng, tạo cảm giác vintage dễ chịu cho mắt.
*   `bg-neo-green` (`#10b981`): Màu xanh lá chủ đạo (Thương hiệu LearnHub), dùng cho các nút kêu gọi hành động (CTA) chính.
*   `bg-neo-blue` (`#3b82f6`): Màu xanh lam dùng cho lọc khóa học và điểm nhấn.
*   `bg-neo-coral` (`#f97316`): Màu cam san hô của Logo.
*   `bg-neo-yellow` (`#eab308`): Màu vàng nổi bật cho các badge quan trọng.

### Các Class Helper Neo-Brutalism Tiện Dụng
| Tên Class | Thuộc Tính CSS Chính | Ý Nghĩa & Cách Sử Dụng |
| :--- | :--- | :--- |
| **`.neo-card`** | `border: 3px solid #0f172a; shadow: 4px 4px 0px #0f172a` | Tạo khung viền đen dày và bóng đổ cứng không làm mờ (flat shadow), dùng cho mọi khối card hiển thị nội dung. |
| **`.neo-card-hover`**| `hover:translate(-3px, -3px); hover:shadow-[7px_7px_0px_#0f172a]` | Thêm hiệu ứng di chuột bay lên 3D và bóng đổ dài ra, tăng độ sinh động khi học viên tương tác. |
| **`.neo-btn`** | `border: 3px solid; shadow: 3px 3px 0px; active:translate(2px, 2px)` | Nút bấm đặc trưng. Khi click (`:active`), nút tự thụt xuống và bóng thu nhỏ còn `1px` tạo cảm giác phản hồi vật lý chân thực. |
| **`.neo-badge`** | `border: 2px solid; shadow: 2px 2px 0px; rounded-full` | Nhãn dán mini dùng cho tags, đánh giá (Rating) hoặc các thông báo ngắn. |

---

## ⚙️ 2. Logic JavaScript / React State Đang Hoạt Động

Trong file [src/App.tsx](file:///d:/test-fe/src/App.tsx), các tính năng tương tác đã được cài đặt sẵn bằng các State của React để thuận tiện cho việc tích hợp tính năng động:

### A. Lọc khóa học theo Danh mục & Tìm kiếm
*   **State:** `activeTab` ('all' | 'web' | 'design' | 'data' | 'mobile') và `searchQuery` (string).
*   **Mô tả:** Khi bấm vào các tab danh mục ở phần *Explore Top-Rated Courses* hoặc gõ vào ô tìm kiếm, danh sách khóa học hiển thị bên dưới sẽ tự động cập nhật ngay lập tức nhờ bộ lọc JS:
    ```javascript
    const filteredCourses = COURSES_DATA.filter((course) => {
      const matchesCategory = activeTab === 'all' || course.category === activeTab
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    ```
*   **Hướng tích hợp JS/API:** Thay vì dùng dữ liệu tĩnh `COURSES_DATA`, bạn có thể dùng `fetch` hoặc `axios` để gọi API lấy danh sách khóa học từ Backend và gán vào một state `courses` trong `useEffect`.

### B. Giả lập thanh tiến trình học tập (Hero section)
*   **State:** `progressPercent` (number) và `isStudying` (boolean).
*   **Mô tả:** Màn hình mô phỏng bên phải Hero chứa thanh tiến trình tự động tăng mỗi 3 giây (được kích hoạt bởi `useEffect`). Nhấp vào nút **Pause Simulation** / **Continue Learning** sẽ thay đổi giá trị `isStudying` để dừng hoặc tiếp tục chạy bộ đếm.
*   **Hướng tích hợp JS/API:** Gắn kết `progressPercent` với tiến trình thực tế của người dùng được lưu trữ trong Database (ví dụ: `user.currentCourseProgress`).

### C. Modal Đăng nhập & Đăng ký (Auth Modal)
*   **State:** `isAuthOpen` (boolean) và `authMode` ('login' | 'signup').
*   **Mô tả:** Nút *Log In*, *Start Free*, và *Start Free Trial* sẽ kích hoạt modal đăng nhập/đăng ký. Form có sẵn kiểm tra dữ liệu đầu vào cơ bản và chuyển đổi qua lại giữa Đăng nhập và Đăng ký.
*   **Hướng tích hợp JS/API:** Bạn chỉ cần thay thế hàm `handleAuthSubmit` bằng logic gửi request POST (gửi `email`, `password`) lên API endpoint của Backend (như `/api/auth/login`), nhận về JWT Token và cập nhật thông tin người dùng đăng nhập.

### D. Xem thông tin khóa học nhanh (Quick View Modal)
*   **State:** `selectedCourse` (Course | null).
*   **Mô tả:** Khi bấm vào nút **Quick View & Info** ở bất kỳ thẻ khóa học nào, thông tin chi tiết (tên giảng viên, mô tả dài, thông số thời lượng, số bài học) sẽ hiện lên trong một Popup Neo-Brutalism bắt mắt. Bạn có thể nhấn *Đăng Ký Học Thử* trực tiếp tại đây để tự động giả lập đăng nhập và đăng ký thành công khóa học đó.

---

## 🚀 3. Hướng Dẫn Chạy Dự Án & Biên Dịch

### Khởi chạy chế độ phát triển (Dev server)
```bash
npm run dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:5173/`

### Build phiên bản production
```bash
npm run build
```
Thư mục chứa mã nguồn tối ưu sau khi build là `/dist`, có thể dễ dàng deploy lên các nền tảng như Vercel, Netlify hoặc Server Hosting của bạn.
