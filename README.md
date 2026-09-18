# 🌌 DỰ ÁN GAME TU TIÊN WEB MULTIPLAYER (TU CHÂN GIỚI)

Dự án game nhập vai tu tiên nhàn rỗi (Idle Xianxia RPG) kết hợp chiến đấu chiến thuật theo lượt (Turn-based Combat) và co-op nhiều người chơi theo thời gian thực (Realtime Multiplayer qua Socket.io).

Thiết kế tối ưu cho nhóm bạn chơi nội bộ (2 - 10 người), dễ dàng khởi chạy trên máy cá nhân và truy cập trực tiếp bằng trình duyệt.

---

## 📚 Hệ Thống Tài Liệu Thiết Kế (Documentation)

Toàn bộ quy trình và đặc tả kỹ thuật chi tiết của game được phân chia thành 7 tài liệu nhỏ trong thư mục [`docs/`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs):

1. **[00_TONG_QUAN.md](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/00_TONG_QUAN.md)**: Tổng quan dự án, mục tiêu, công nghệ (Node.js, Express, Socket.io, React, Tailwind, SQLite) và kiến trúc thư mục.
2. **[01_CANH_GIOI_VA_THE_CHAT.md](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/01_CANH_GIOI_VA_THE_CHAT.md)**: Hệ thống 9 đại cảnh giới (Luyện Khí $\rightarrow$ Độ Kiếp), công thức tu vi/giây, bảng phân cấp Thể Chất (Thánh Thể, Thần Thể) và cơ chế Tẩy Tủy.
3. **[02_DONG_PHU_VA_NONG_TRAI.md](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/02_DONG_PHU_VA_NONG_TRAI.md)**: Động phủ, Giếng nước linh khí, Cụ Linh Trận, 3 phân khu Dược viên (Chế Đan, Luyện Hóa, Quý Hiếm), thao tác AOE và Luyện Đan Phòng.
4. **[03_CHIEN_DAU_VA_LICH_LUYEN.md](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/03_CHIEN_DAU_VA_LICH_LUYEN.md)**: Combat Engine turn-based, ngũ hành tương khắc, quản lý thể lực, lịch luyện solo (Đánh thường, Kết quả nhanh, Nhanh x10) và cơ chế rơi đồ.
5. **[04_BI_CANH_VA_TO_DOI.md](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/04_BI_CANH_VA_TO_DOI.md)**: Hệ thống Tổ Đội Realtime 1 - 5 người, kiểm tra thể lực đồng đội, 4 Đại Bí Cảnh Luyện Hư (Kim Cương, U Minh, Vạn Mộc, Huyết Ma), Bát Môn Độn Giáp và cây Kỳ Ngộ.
6. **[05_BOSS_THE_GIOI_VA_MULTIPLAYER.md](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/05_BOSS_THE_GIOI_VA_MULTIPLAYER.md)**: Săn Boss Thế Giới đồng bộ HP realtime, hồi phục và chu kỳ 30s CD, xếp hạng DPS và khung Chat thế giới.
7. **[06_DATABASE_SCHEMA_VA_API.md](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/06_DATABASE_SCHEMA_VA_API.md)**: Sơ đồ thực thể ERD, các bảng dữ liệu SQLite, đặc tả REST API và danh sách sự kiện Socket.io.

---

## 🚀 Các Bước Thực Hiện Tiếp Theo

1. **Khởi tạo Backend Server & Database SQLite**: Dựng khung Node.js, Express, Socket.io và tạo database `tutien.db`.
2. **Khởi tạo Frontend React + Vite + Tailwind CSS**: Xây dựng giao diện Động Phủ huyền ảo, responsive trên cả máy tính và điện thoại.
3. **Ghép nối từng Module**: Lắp ráp Cảnh giới $\rightarrow$ Nông trại $\rightarrow$ Lịch luyện $\rightarrow$ Tổ đội Bí cảnh $\rightarrow$ Săn Boss.
