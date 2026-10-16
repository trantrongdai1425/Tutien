# [28] DISCORD ACTIVITIES: NHÚNG WEB GAME TIÊN HIỆP, GACHA THIÊN PHÚ & QUY CHUẨN WEB HOSTING

> ⬅️ **[Bài Trước: Doc 27 - Bản Mệnh Thần Thức: Hoạch Định Discord Bot](file:///d:/bai%20tap%20ki%204/code%20tutien/docs/27_DISCORD_BOT_HOACH_DINH_VA_TRIEN_KHAI.md)** | 📖 **[Mục Lục Toàn Cảnh](file:///d:/bai%20tap%20ki%204/code%20tutien/README.md)** | ➡️ **[Tổng Quan Toàn Cảnh: Doc 00](file:///d:/bai%20tap%20ki%204/code%20tutien/docs/00_TONG_QUAN.md)**

> *"Thiên ngoại hữu thiên, giới ngoại hữu giới. Thần thông tối thượng không phải là nhốt tiên cảnh vào những dòng chữ đơn sơ, mà là mở ra một cánh cổng hư không (Discord Activity iFrame) ngay giữa lòng đàm đạo, để chư vị đạo hữu cùng bước chân vào Tu Chân Giới tráng lệ — tận mắt chiêm ngưỡng lôi đình rực sáng, tự tay gieo 20 quẻ thiên mệnh nghịch thiên cải mệnh!"*

Tài liệu này đặc tả quy chuẩn kỹ thuật toàn diện để biến Web Game **Tu Chân Giới** thành một **Discord Activity (Hoạt Động Nhúng Chính Thức của Discord)**, tích hợp cơ chế **Gacha Thiên Mệnh 20 Lần Chọn 1**, hệ thống **Tẩy Tủy Phân Tầng Lũy Tiến Chống Spam**, và toàn bộ quy trình **Xử lý Web Hosting (HTTPS/WSS)**.

---

## 🚀 I. BẢN CHẤT CỦA DISCORD ACTIVITIES (EMBEDDED APP)

### 1. Tại Sao Lựa Chọn Discord Activity Thay Vì Text Bot?
Trong Discord, bên cạnh khung chat và phòng Voice có biểu tượng **Hoạt Động (Activities / Tên lửa 🚀)**. Đây là tính năng cho phép nhúng trực tiếp một Web Application vào cửa sổ Discord:

```mermaid
flowchart TD
    subgraph DiscordClient [ỨNG DỤNG DISCORD (PC & MOBILE)]
        Click[Người chơi bấm biểu tượng 'Hoạt Động'] --> Launcher[Danh mục Hoạt Động Gợi Ý]
        Launcher --> SelectGame[Chọn: 'Tu Chân Giới (Tu Tiên RPG)']
        SelectGame --> ActivityFrame[Khung Hình iFrame Full Màn Hình]
    end

    subgraph WebGameEngine [MÁY CHỦ WEB GAME TU CHÂN GIỚI]
        ActivityFrame <-->|HTTPS / WSS| ExpressServer[Node.js Express + Socket.io Server]
        ExpressServer <--> Canvas2D[Canvas 2D Động Phủ & Hiệu Ứng Lôi Kiếp 60 FPS]
        ExpressServer <--> DB[(database.json)]
        ExpressServer <--> GeminiAI[Google Gemini AI Sư Tôn]
    end

    subgraph DiscordSDKLayer [DISCORD EMBEDDED APP SDK]
        ActivityFrame <--> SDK[@discord/embedded-app-sdk]
        SDK --> AutoAuth[Tự Động Xác Thực: User ID, Avatar, Tên Tài Khoản]
    end
```

### 2. Ưu Thế Vượt Trội Tuyệt Đối
- **Đồ họa sống động 100%**: Có Canvas 2D Động phủ, hiệu ứng sấm sét nổ tung màn hình khi độ kiếp, thanh máu cửu sắc, âm thanh nhạc nền cổ phong.
- **Tự động nhận diện tài khoản**: Người chơi không cần gõ mật khẩu hay nhớ ID. Discord SDK tự cấp danh tính, tự động lưu tiến trình tu vi.
- **Chơi một mình (Riêng tư) hoặc Co-op nhiều người**: Người chơi có thể bế quan một mình, hoặc mở phòng cho cả nhóm bạn trong kênh Voice cùng nhảy vào săn Boss Thế Giới.

---

## 🎨 II. QUY CHUẨN THIẾT KẾ GIAO DIỆN (UI/UX) CHO DISCORD ACTIVITY

### 1. Kích Thước Khung Hình & Tính Tương Thích Thiết Bị
- **Khung Discord PC/Mac (16:9)**: Tối ưu cho độ phân giải từ $1280 \times 720$ đến $1920 \times 1080$. Giao diện Widescreen của game hiển thị trọn vẹn, không bị che khuất.
- **Khung Discord Mobile (9:16)**: Co giãn tự động nhờ CSS Flexbox và Viewport Meta:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  ```

### 2. Tông Màu Thủy Mặc Huyền Ảo (Dark Daoist)
Màu nền game sử dụng mã màu `#0f172a` (Huyền Vũ Dạ Mặc) kết hợp viền Hoàng Kim `#d4af37` và Khí Lam `#38bdf8`, ăn khớp hoàn hảo với nền tối của Discord (`#1e1f22`, `#2b2d31`).

### 3. Tích Hợp Avatar Discord Vào Khung Tiên Tự
Góc trên bên trái của giao diện game tự động hiển thị:
- **Ảnh đại diện Discord** với khung viền lôi đình theo cảnh giới.
- **Đạo Hiệu Bản Mệnh** (Do người chơi tự đặt) kèm chức vị Tông Môn.

---

## 🎲 III. HỆ THỐNG GACHA THIÊN MỆNH TOÀN DIỆN

Hệ thống Gacha được chia làm 2 giai đoạn tách biệt rõ ràng nhằm cân bằng trải nghiệm người chơi và kinh tế game:

```mermaid
flowchart TD
    subgraph Phase1 [GIAI ĐOẠN 1: TẠO NHÂN VẬT (KHỞI NGUYÊN)]
        Start[Gõ /nhap_mon hoặc Mở Game] --> Roll20[Hệ thống tự động quay 20 Quẻ Thiên Mệnh Miễn Phí]
        Roll20 --> Score[Chấm điểm Khí Vận 1 - 100 cho từng quẻ]
        Score --> Select1[Người chơi tự do CHỌN 1 TRONG 20 QUẺ]
        Select1 --> LockStarter[Khóa vĩnh viễn tính năng Chọn 1 trong 20]
    end

    subgraph Phase2 [GIAI ĐOẠN 2: TRONG GAME (NGHỊCH THIÊN CẢI MỆNH)]
        Ingame[Động Phủ -> Tẩy Tủy Hoán Cốt] --> ChoosePool{Chọn Bể Gacha Chuyên Biệt}
        ChoosePool -->|Bể Linh Căn| Pool1[5,000 LT x Hệ Số Ngày]
        ChoosePool -->|Bể Thể Chất| Pool2[25,000 LT + 1 Yêu Đan G3 x Hệ Số]
        ChoosePool -->|Bể Khí Vận| Pool3[15,000 LT x Hệ Số Ngày]
        ChoosePool -->|Khóa Linh Căn Tẩy Thể Chất| Pool4[Phụ phí +100% Linh Thạch]
        Pool1 & Pool2 & Pool3 & Pool4 --> RollNew[Quay ra 1 Quẻ Mới]
        RollNew --> Compare{Quy Tắc: Lấy Mới Hoặc Giữ Cũ}
        Compare -->|Đồng Ý| ApplyNew[Ghi đè Thiên Phú Mới]
        Compare -->|Từ Chối| KeepOld[Giữ nguyên Bản Cũ - Không sợ tụt lùi]
    end

    Phase1 --> Phase2
```

---

### 1. Giai Đoạn 1: Gacha Khởi Nguyên (20 Lần Miễn Phí — Chọn 1 Trong 20)
- **Quy tắc**: Mỗi tân thủ khi bước chân vào game được quay **20 combo thiên phú ngẫu nhiên**.
- **Chấm điểm Khí Vận**:
  $$\text{Điểm Khí Vận} = \text{Điểm Linh Căn (40%)} + \text{Điểm Thể Chất (35%)} + \text{Điểm Ngộ Tính (15%)} + \text{Ẩn Mạch (10%)}$$
  - Điểm $\ge 90$: **Thái Cổ Cực Phẩm (Đỏ)** — Ví dụ: Biến Dị Lôi Căn + Hoang Cổ Thánh Thể.
  - Điểm $80 - 89$: **Thiên Phẩm Hoàng Kim (Vàng)** — Ví dụ: Thuần Dương Hỏa Căn + Kiếm Cốt.
  - Điểm $65 - 79$: **Chân Phẩm Thượng Thừa (Tím)**.
  - Điểm $< 65$: **Phàm Phẩm Căn Cơ (Lam/Xám)**.
- **Trải nghiệm chọn**: Hiển thị bảng Top 3 quẻ cao điểm nhất kèm danh sách 20 quẻ. Người chơi click chọn 1 quẻ ưng ý nhất để bắt đầu hành trình.

---

### 2. Giai Đoạn 2: Tẩy Tủy Trong Game Bằng Linh Thạch (Lấy Mới Hoặc Giữ Cũ)
Sau khi tạo nhân vật, tính năng "chọn 1 trong 20" đóng vĩnh viễn. Muốn đổi thiên phú, người chơi phải vào **Động Phủ $\rightarrow$ Tẩy Tủy Hoán Cốt**.

#### A. Phân Hạng Bể Gacha Riêng Biệt
1. **Bể Ngũ Hành Linh Căn**: Giá cơ bản **$5,000\text{ LT}$** (Chỉ quay lại hệ Linh Căn).
2. **Bể Thể Chất Bản Mệnh**: Giá cơ bản **$25,000\text{ LT} + 1\text{ Yêu Đan Giai 3}$** (Vì thay đổi cốt tủy cần dược lực mạnh).
3. **Bể Khí Vận & Ẩn Mạch**: Giá cơ bản **$15,000\text{ LT}$** (Mở từ Trúc Cơ Kỳ).
4. **Bể Thái Cổ Toàn Năng**: Giá cơ bản **$60,000\text{ LT} + 1\text{ Tẩy Tủy Đan}$** (Tẩy toàn bộ ở phẩm cấp cao nhất).

#### B. Cơ Chế Tăng Giá Lũy Tiến Trong Ngày (Anti-Spam Scaling)
Để ngăn chặn tình trạng đại gia ngồi spam liên tục làm lạm phát chỉ số, chi phí Linh Thạch sẽ nhân theo số lần gacha trong ngày:

$$\text{Chi Phí Thực Tế} = \text{Giá Gốc} \times \text{Hệ Số Lũy Tiến}$$

| Lần Quay Trong Ngày | Hệ Số Nhân | Chi Phí Bể Thể Chất Thực Tế |
| :---: | :---: | :---: |
| **Lần 1** | $100\%$ (Giá gốc) | $25,000\text{ LT}$ |
| **Lần 2** | $150\%$ | $37,500\text{ LT}$ |
| **Lần 3** | $200\%$ | $50,000\text{ LT}$ |
| **Lần 4** | $300\%$ | $75,000\text{ LT}$ |
| **Lần 5 trở đi** | $500\%$ | $125,000\text{ LT}$ (Cực đắt) |

> ⏰ **Thời gian Reset**: Tự động đưa hệ số về $100\%$ vào đúng **00:00 mỗi ngày**.

#### C. Tính Năng "Khóa Dòng Bảo Mệnh" (Lock-in Slot Gacha)
- Nếu người chơi đã có Linh Căn Đỏ nhưng Thể Chất cùi: Cho phép **Khóa Linh Căn**, chỉ quay Thể Chất.
- **Phụ Phí Khóa Dòng**: **Cộng thêm $+100\%$ Linh Thạch** trên tổng chi phí của lượt quay đó.

#### D. Nguyên Tắc An Toàn: "Lấy Mới Hoặc Giữ Cũ"
Sau khi quay ra kết quả mới, màn hình hiện bảng so sánh 2 cột:
- Bấm **`[ ✅ LẤY MỚI ]`**: Cập nhật thiên phú mới.
- Bấm **`[ ❌ GIỮ CŨ ]`**: Bỏ kết quả vừa quay, giữ nguyên trạng thái cũ. Không bao giờ sợ bị tụt lùi!

---

## 🌐 IV. XỬ LÝ WEB HOSTING & TRIỂN KHAI CHO DISCORD ACTIVITIES

Discord yêu cầu nghiêm ngặt:
- **Bắt buộc HTTPS (SSL) và WSS (Secure WebSocket)**.
- Máy chủ phải hỗ trợ phân phát file tĩnh nhanh chóng và xử lý Socket.io thời gian thực.

---

### PHƯƠNG ÁN 1: CHẠY THỬ NGHIỆM LOCAL BẰNG CLOUDFLARE TUNNEL (MIỄN PHÍ 100%)
Dành cho việc phát triển và test nội bộ cùng bạn bè ngay trên máy cá nhân mà không tốn 1 xu:

1. **Khởi động server game nội bộ**:
   ```powershell
   cd "d:\bai tap ki 4\code tutien"
   npm start
   # Server lắng nghe tại http://localhost:3000
   ```
2. **Kích hoạt Cloudflare Tunnel**:
   Tải `cloudflared` và gõ:
   ```powershell
   cloudflared tunnel --url http://localhost:3000
   ```
3. **Nhận URL HTTPS**:
   Cloudflare cấp ngay một URL công khai bảo mật, ví dụ:
   `https://tu-tien-dai-dao.trycloudflare.com`
4. Dán URL này vào Discord Developer Portal là game chạy ngay trong Discord!

---

### PHƯƠNG ÁN 2: TRIỂN KHAI CHẠY ONLINE 24/7 (CLOUD DEPLOYMENT)
Khi muốn tắt máy tính mà game trong Discord vẫn mở được 24/7:

#### 1. Triển Khai Miễn Phí Lên Render.com
- Đẩy mã nguồn lên GitHub: `https://github.com/trantrongdai1425/Tutien.git`.
- Đăng nhập [Render.com](https://render.com) $\rightarrow$ Chọn **New Web Service**.
- Kết nối với repo GitHub `Tutien`.
- Cấu hình:
  - **Environment**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `node server/server.js`
- Render tự động cấp tên miền HTTPS miễn phí: `https://tutien-game.onrender.com`.

#### 2. Triển Khai Chuyên Nghiệp Trên VPS Linux (Ubuntu)
- Thuê VPS rẻ (50k - 80k/tháng tại Vietnix / CloudFly).
- Cài đặt **Node.js 20 LTS**, **Nginx** làm Reverse Proxy, và cấp chứng chỉ SSL miễn phí qua **Certbot (Let's Encrypt)**.
- Quản lý tiến trình chạy nền không bao giờ tắt bằng **PM2**:
  ```bash
  pm2 start server/server.js --name "tutien-server"
  pm2 startup
  pm2 save
  ```

---

## ⚙️ V. CÁC BƯỚC CẤU HÌNH TRÊN DISCORD DEVELOPER PORTAL

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications).
2. Chọn ứng dụng của bạn (hoặc tạo mới: `Tu Chân Giới`).
3. Đi tới mục **Embedded App** (hoặc **Activities**):
   - Đặt tên Hoạt Động: `Tu Chân Giới - Tu Tiên RPG`.
   - Bật cờ: `Supports Activities` $\rightarrow$ **ON**.
   - Tải lên Icon và Cover Art (16:9) để hiển thị trong danh mục gợi ý của Discord.
4. Tại mục **URL Mappings**:
   - `Prefix`: `/`
   - `Target`: Đường dẫn HTTPS của game (Ví dụ: URL từ Cloudflare Tunnel hoặc Render).
5. Lưu thay đổi $\rightarrow$ Mở Discord, bấm biểu tượng Hoạt Động (🚀) $\rightarrow$ Game Tu Chân Giới sẽ sáng rực sẵn sàng để trải nghiệm!

---

## 🧠 VI. TÍCH HỢP KHÍ LINH SƯ TÔN AI TRONG GIAO DIỆN WEB DISCORD

Khi chạy trong Discord Activity, AI không chỉ là bot chat text đơn điệu:
1. **Widget Khí Linh Sống Động**: Nằm ở góc dưới bên phải màn hình game với hiệu ứng hào quang lấp lánh.
2. **Streaming Typing Effect**: Lời thoại của Sư Tôn hiện ra từng chữ một theo phong cách tiên hiệp cổ phong.
3. **Ảo Cảnh Tâm Ma Khi Đột Phá**:
   - Khi bấm đột phá đại cảnh giới, một cửa sổ cổ kính mở ra: Sư Tôn đưa ra câu hỏi thử thách đạo tâm.
   - Người chơi gõ lời đáp $\rightarrow$ AI Gemini chấm điểm Đạo Tâm thời gian thực để tăng/giảm tỉ lệ sống sót trước Lôi Kiếp!
