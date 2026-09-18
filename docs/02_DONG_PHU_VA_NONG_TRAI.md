# [02] HỆ THỐNG ĐỘNG PHỦ, NÔNG TRẠI & LUYỆN ĐAN

Hệ thống Động Phủ cung cấp nguồn tài nguyên dồi dào để chế tạo đan dược hồi thể lực, tăng tu vi và đột phá cảnh giới thông qua cơ chế làm vườn nhàn rỗi.

---

## 1. Giếng Nước Linh Khí & Cụ Linh Trận (The Spirit Well)

- **Công dụng**: Cung cấp Nước Linh Khí phục vụ việc tưới tắm cho các dược thảo.
- **Thời gian hồi chiêu (Cooldown)**:
  - Mặc định: $10 \text{ phút } 5 \text{ giây}$ ($605 \text{ giây}$).
  - Khi kích hoạt **Cụ Linh Trận**: Rút ngắn xuống còn **$4 \text{ phút } 35 \text{ giây}$** ($275 \text{ giây}$).
- **Trạng thái**:
  - `READY`: Có thể bấm **[Múc Nước Giếng]**.
  - `COOLDOWN`: Đếm ngược thời gian hồi. Có nút **[Làm Mới]** để kiểm tra đồng bộ server.

---

## 2. Ba Phân Khu Dược Viên (The 3 Herb Gardens)

Động phủ gồm 3 phân khu vườn chuyên biệt:
1. **Vườn Chế Đan**: Trồng các loại linh thảo cơ bản dùng luyện đan tăng tu vi, thể lực (*Huyền Sâm, Linh Chi, Hoàng Tinh*).
2. **Vườn Luyện Hóa**: Trồng linh thảo hỗ trợ thối thể, tăng ngự thủ (*Huyết Mộc, Thiết Cốt Thảo, Băng Tinh Thảo*).
3. **Vườn Quý Hiếm**: Trồng kỳ hoa dị thảo quý hiếm bậc nhất dùng luyện Thánh Đan (*Cửu Diệp Chi Lan, Ngộ Đạo Trà, Thiên Sơn Tuyết Liên*).

---

## 3. Chu Kỳ Sinh Trưởng & Cơ Chế Chăm Sóc AOE

Mỗi ô đất trồng thảo dược có các thông số cần người chơi chăm sóc:

```mermaid
flowchart LR
    Stage0["Hạt Giống (0)"] --> Stage1["Nảy Mầm (1)"]
    Stage1 --> Stage2["Cây Non (2)"]
    Stage2 --> Stage3["Cây Lớn (3)"]
    Stage3 --> Stage4["Chín Muồi (4)\n(Thu Hoạch)"]
```

### Các Thao Tác Chăm Sóc AOE:
- **Tưới Nước AOE (Thủy)**:
  - Mỗi ô đất hiển thị độ ẩm (ví dụ: $x/5$).
  - Khi $x < 5$: Cần tưới nước để cây tăng tốc lớn lên.
- **Bón Phân AOE (Thổ)**:
  - Mỗi ô đất hiển thị độ màu mỡ (ví dụ: $y/6$).
  - Khi $y < 6$: Cần bón linh phân để gia tăng phẩm chất quả.
- **Bắt Sâu AOE (Kim)**:
  - Quét sạch linh trùng phá hoại mùa màng trên toàn bộ các ô đất.
- **Thu Hoạch AOE**:
  - Khi tỷ lệ ô đạt trạng thái **(Chín muồi) $\ge 80\%$**, kích hoạt nút **[Thu Hoạch AOE]** gom toàn bộ thảo dược vào túi đồ.
  - Vườn tự động bước vào chu kỳ hồi đất tiếp theo.

---

## 4. Luyện Đan Phòng (Alchemy Furnace)

Dùng thảo dược thu hoạch từ vườn để phối chế đan dược:

| Tên Đan Dược | Nguyên Liệu Yêu Cầu | Tác Dụng |
| :--- | :--- | :--- |
| **Thể Lực Đan** (Hạ/Trung/Thượng) | $10 \text{ Linh Chi} + 5 \text{ Hoàng Tinh}$ | Hồi ngay $+20 \rightarrow +100 \text{ Thể Lực}$ |
| **Trúc Cơ Đan** | $15 \text{ Huyền Sâm} + 10 \text{ Huyết Mộc}$ | Tăng $+30\%$ tỉ lệ Đột phá Trúc Cơ |
| **Kim Đan Đan** | $30 \text{ Huyền Sâm} + 20 \text{ Băng Tinh Thảo}$ | Tăng $+35\%$ tỉ lệ Đột phá Kim Đan |
| **Tẩy Tủy Đan** | $20 \text{ Thiết Cốt Thảo} + 10 \text{ Linh Chi}$ | Tẩy Tủy miễn phí không tốn Linh Thạch |
| **Hồi Huyết Đan** | $10 \text{ Hoàng Tinh} + 5 \text{ Huyết Mộc}$ | Hồi phục $100\%$ sinh lực trong trận đánh |
