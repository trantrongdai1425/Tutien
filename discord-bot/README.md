# 🌌 TU CHÂN GIỚI - DISCORD BOT AI EDITION

Phiên bản Bot Discord tích hợp trí tuệ nhân tạo (Google Gemini LLM) và đồng bộ dữ liệu người chơi trực tiếp với Web Game Tu Chân Giới thông qua cơ chế **Shared Database**.

---

## ⚡ Tính Năng Nổi Bật

1. **Đồng Bộ Dữ Liệu Hoàn Toàn (Cross-Play)**: Chơi trên Web hay gõ lệnh trên Discord đều chung 1 nhân vật, 1 kho đồ, 1 tiến trình tu vi.
2. **Hệ Thống Lệnh Slash Command (`/`)**:
   - `/nhap_mon`: Khởi tạo nhân vật mới trực tiếp từ Discord.
   - `/lien_ket`: Liên kết tài khoản Discord với nhân vật đã có trên Web Game.
   - `/tu_vi`: Xem bảng thông tin nhân vật bằng Rich Embed Cổ Phong kèm 4 nút bấm tương tác: `[🧘 Vận Công]`, `[⚡ Đột Phá]`, `[📜 Kỳ Ngộ]`, `[🔮 Sư Tôn]`.
   - `/tu_luyen`: Thiền định vận công một chu thiên tăng tu vi.
   - `/dot_pha`: Dẫn động thiên kiếp, vượt qua lôi phạt để thăng tiến cảnh giới.
   - `/ky_ngo`: Tầm bảo bát hoang, AI sinh tình huống ngẫu nhiên và lựa chọn hành động.
   - `/su_ton`: Mở Thần Thức Thread riêng tư để đàm đạo tu chân cùng AI Sư Tôn / Khí Linh.
3. **AI Khí Linh & Sư Tôn Tàn Hồn (Google Gemini)**:
   - Tự động chat trong Thread với văn phong tiên hiệp cổ phong.
   - Nắm rõ cảnh giới, linh căn, đan độc của người chơi để đưa ra lời chỉ bảo sắc bén.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (3 Bước)

### Bước 1: Cài đặt thư viện dependencies
Mở terminal tại thư mục này (`d:\bai tap ki 4\code tutien\discord-bot`) và chạy:
```bash
npm install
```

### Bước 2: Cấu hình thông số Bot & AI Key
Tạo file `.env` (sao chép từ `.env.example`):
```env
DISCORD_TOKEN=MTE5OTkx...      # Token bot lấy tại Discord Developer Portal
CLIENT_ID=119991...          # Application ID lấy tại Discord Developer Portal
GUILD_ID=123456...           # (Tùy chọn) ID Server Discord để test lệnh tức thì
GEMINI_API_KEY=AIzaSy...     # API Key Google Gemini (Lấy miễn phí tại https://aistudio.google.com/)
```

### Bước 3: Đăng ký lệnh và khởi chạy Bot
```bash
# Đăng ký danh sách Slash Commands lên Discord
npm run deploy

# Khởi chạy Bot
npm start
```

---

## 📚 Tài Liệu Đặc Tả Chi Tiết

Xem chi tiết quy chuẩn kiến trúc và lộ trình hoàn chỉnh tại:
- **[Doc 27: Hoạch Định & Triển Khai Phiên Bản Discord Bot AI](file:///d:/bai%20tap%20ki%204/code%20tutien/docs/27_DISCORD_BOT_HOACH_DINH_VA_TRIEN_KHAI.md)**
