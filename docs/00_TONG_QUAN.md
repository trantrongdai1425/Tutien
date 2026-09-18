# [00] TỔNG QUAN HỆ THỐNG GAME TU TIÊN WEB NỘI BỘ

## 1. Mục Tiêu Dự Án
- **Tên dự án**: Tu Chân Giới (Web Xianxia Multiplayer).
- **Mục đích**: Tự tạo một tựa game Tu Tiên dạng Web đa người chơi để chơi nội bộ cùng nhóm bạn (2 - 10 người).
- **Đặc trưng**:
  - Tiết tấu chơi nhàn rỗi (Idle) kết hợp hành động chiến thuật (Turn-based combat).
  - Tương tác realtime qua Socket.io: Chat thế giới, Tổ đội đi Bí Cảnh (1 - 5 người), cùng đánh Boss Thế Giới.
  - Giao diện Tiên Hiệp huyền ảo phong cách Dark Daoist, hiện đại, mượt mà trên cả PC và Mobile.

---

## 2. Ngăn Xếp Công Nghệ (Tech Stack)
* **Backend**:
  * Runtime: Node.js (v24+)
  * Framework: Express.js
  * Realtime: Socket.io
  * Database: SQLite (nhẹ, lưu thành 1 file duy nhất `tutien.db`, không cần cài đặt thêm phần mềm DB)
* **Frontend**:
  * Build Tool: Vite
  * Framework: React
  * Styling: Tailwind CSS
  * Icons: Lucide-React
  * Animation: Framer Motion / CSS Keyframes huyền ảo

---

## 3. Cấu Trúc Tài Liệu Module (.md)
Tài liệu được chia nhỏ thành các file độc lập để dễ kiểm soát và phát triển:

| File | Tên Module | Nội Dung Trọng Tâm |
| :--- | :--- | :--- |
| [`00_TONG_QUAN.md`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/00_TONG_QUAN.md) | Tổng Quan | Mục tiêu, tech stack, kiến trúc tổng thể |
| [`01_CANH_GIOI_VA_THE_CHAT.md`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/01_CANH_GIOI_VA_THE_CHAT.md) | Cảnh Giới & Thể Chất | Hệ thống tu vi/giây, cấp bậc cảnh giới, danh sách thể chất, cơ chế tẩy tủy |
| [`02_DONG_PHU_VA_NONG_TRAI.md`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/02_DONG_PHU_VA_NONG_TRAI.md) | Nông Trại & Luyện Đan | Giếng linh khí, Cụ Linh Trận, 3 vườn dược liệu, thao tác AOE, công thức luyện đan |
| [`03_CHIEN_DAU_VA_LICH_LUYEN.md`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/03_CHIEN_DAU_VA_LICH_LUYEN.md) | Chiến Đấu & Lịch Luyện | Công thức sát thương, ngũ hành, thể lực, lịch luyện solo x1 / x10, tỉ lệ rơi đồ |
| [`04_BI_CANH_VA_TO_DOI.md`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/04_BI_CANH_VA_TO_DOI.md) | Bí Cảnh & Tổ Đội | 4 Ải Luyện Hư, cơ chế phòng tổ đội 1-5 người, Bát Môn Độn Giáp, cây sự kiện Kỳ Ngộ |
| [`05_BOSS_THE_GIOI_VA_MULTIPLAYER.md`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/05_BOSS_THE_GIOI_VA_MULTIPLAYER.md) | Boss & Multiplayer | Săn World Boss theo hiệp (CD 30s), DPS ranking realtime, chat thế giới |
| [`06_DATABASE_SCHEMA_VA_API.md`](file:///c:/Users/newre/OneDrive/Máy%20tính/code%20tutien/docs/06_DATABASE_SCHEMA_VA_API.md) | CSDL & Giao Tiếp API | Bảng dữ liệu SQLite, danh sách REST API và Socket.io Events |

---

## 4. Kiến Trúc Thư Mục Source Code Dự Kiến
```text
code tutien/
├── docs/                 # Thư mục tài liệu thiết kế (.md)
├── server/               # Backend (Express + Socket.io + SQLite)
│   ├── src/
│   │   ├── config/       # Cấu hình cổng, DB
│   │   ├── controllers/  # Xử lý request API
│   │   ├── models/       # Định nghĩa Schema & Truy vấn SQLite
│   │   ├── services/     # Logic game (Combat, Farm, Cultivation...)
│   │   ├── sockets/      # Xử lý sự kiện realtime Socket.io
│   │   └── server.js     # Entry point backend
│   └── package.json
├── client/               # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/   # UI: Header, Chat, Động phủ, Bí cảnh...
│   │   ├── pages/        # Màn hình chính
│   │   ├── services/     # Gọi API & kết nối Socket client
│   │   └── App.jsx
│   └── package.json
└── README.md
```
