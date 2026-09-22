// public/dongPhu2D.js - Động Cơ Đồ Họa 2D Thủy Mặc Họa (Chinese Ink Wash Painting Canvas Engine)
// Phong cách: Giấy Dó, Mực Mặc Sắc, Núi Mây Sương Mờ, Điểm Nhấn Chu Sa Đỏ Son, 60 FPS Mượt Mà

class DongPhu2DEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // Kích thước logic
    this.width = this.canvas.clientWidth || 700;
    this.height = this.canvas.clientHeight || 300;

    // Dữ liệu tu sĩ
    this.charData = null;
    this.statsData = null;

    // Giao diện Sáng (Bạch Trú) / Tối (Dạ Mặc)
    this.theme = (document.body && document.body.getAttribute("data-theme") === "dark") ? "dark" : "light";

    // Time & Animation
    this.time = 0;
    this.isRunning = false;
    this.isQiBoosted = false;
    this.boostTimer = 0;

    // Chuột & Tương tác
    this.mouse = { x: this.width / 2, y: this.height / 2, isHovered: false };
    this.inkRipples = [];
    this.floatingTexts = [];

    // Hạt Linh Khí Mực & Chu Sa
    this.particles = [];
    this.initParticles(80);

    // Phi Kiếm Mực Thủy Mặc
    this.sword = {
      angle: 0,
      radiusX: 130,
      radiusY: 48,
      speed: 0.03,
      trail: [],
      maxTrail: 18
    };

    // Sương mây trôi
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: 40 + Math.random() * (this.height - 100),
        rx: 80 + Math.random() * 90,
        ry: 25 + Math.random() * 25,
        speed: 0.15 + Math.random() * 0.25,
        alpha: 0.35 + Math.random() * 0.25
      });
    }

    this.setupEvents();
    this.resize();
    this.start();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 700;
    this.height = rect.height || 300;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupEvents() {
    window.addEventListener("resize", () => this.resize());

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.isHovered = true;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouse.isHovered = false;
    });

    // Bấm tạo vết loang mực & nhận đạo tâm
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      this.triggerShockwave(clickX, clickY);
      this.addFloatingText("+1 Đạo Tâm", clickX, clickY - 10, "#B3261E");
    });
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomDist = false) {
    const cx = this.width / 2;
    const cy = this.height / 2 + 15;
    const angle = Math.random() * Math.PI * 2;
    const dist = randomDist ? (30 + Math.random() * 220) : (160 + Math.random() * 80);

    const isCinnabar = Math.random() < 0.22; // 22% hạt chu sa đỏ, còn lại là mực đen
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      targetX: cx,
      targetY: cy - 10, // Dantian
      speed: 0.7 + Math.random() * 1.3,
      size: 1.2 + Math.random() * 2.2,
      color: isCinnabar ? "#B3261E" : "#1A1A1A",
      alpha: 0.2 + Math.random() * 0.65,
      angle: angle,
      spiralSpeed: 0.015 + Math.random() * 0.025
    };
  }

  updateState(char, stats) {
    this.charData = char;
    this.statsData = stats;
  }

  setTheme(theme) {
    this.theme = theme;
  }

  triggerShockwave(x, y) {
    this.inkRipples.push({
      x,
      y,
      radius: 4,
      maxRadius: 65,
      alpha: 0.85,
      color: Math.random() < 0.4 ? "#B3261E" : "#1A1A1A",
      lineWidth: 2
    });
  }

  triggerSwordSlash() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    for (let i = -1; i <= 1; i++) {
      setTimeout(() => {
        this.inkRipples.push({
          x: cx + i * 40,
          y: cy + i * 20,
          radius: 10,
          maxRadius: 130,
          alpha: 1.0,
          color: "#1A1A1A",
          isSlash: true,
          lineWidth: 3.5
        });
        this.addFloatingText("⚔️ THÁI HƯ KIẾM Ý", cx, cy - 50 - i * 20, "#B3261E");
      }, (i + 1) * 110);
    }
  }

  boostQi() {
    this.isQiBoosted = true;
    this.boostTimer = 300;
    this.triggerShockwave(this.width / 2, this.height / 2 + 15);
    this.addFloatingText("🌪️ TỤ LINH TRẬN KHỞI!", this.width / 2, this.height / 2 - 60, "#B3261E");
  }

  addFloatingText(text, x, y, color = "#B3261E") {
    this.floatingTexts.push({
      text,
      x,
      y,
      alpha: 1.0,
      color,
      vy: -1.1
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    this.time += 0.025;

    if (this.boostTimer > 0) {
      this.boostTimer--;
      if (this.boostTimer <= 0) this.isQiBoosted = false;
    }

    const cx = this.width / 2;
    const cy = this.height / 2 + 15;
    const speedMult = this.isQiBoosted ? 2.4 : 1.0;

    // Hạt mực linh khí
    this.particles.forEach((p, idx) => {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      p.angle += p.spiralSpeed * speedMult;
      p.x += (dx / (dist + 1)) * p.speed * speedMult + Math.cos(p.angle) * 0.5;
      p.y += (dy / (dist + 1)) * p.speed * speedMult + Math.sin(p.angle) * 0.5;

      if (this.mouse.isHovered) {
        const mdx = this.mouse.x - p.x;
        const mdy = this.mouse.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 90) {
          p.x += (mdx / (mdist + 1)) * 1.4;
          p.y += (mdy / (mdist + 1)) * 1.4;
        }
      }

      if (dist < 12) {
        this.particles[idx] = this.createParticle(false);
      }
    });

    // Phi kiếm mực
    const swordSpeed = this.isQiBoosted ? this.sword.speed * 2.0 : this.sword.speed;
    this.sword.angle += swordSpeed;
    const sx = cx + Math.cos(this.sword.angle) * this.sword.radiusX;
    const sy = cy - 25 + Math.sin(this.sword.angle) * this.sword.radiusY;

    this.sword.trail.unshift({ x: sx, y: sy, alpha: 0.9 });
    if (this.sword.trail.length > this.sword.maxTrail) {
      this.sword.trail.pop();
    }
    this.sword.trail.forEach(t => t.alpha *= 0.86);

    // Vết loang mực
    this.inkRipples = this.inkRipples.filter(r => {
      r.radius += 2.2;
      r.alpha -= 0.025;
      return r.alpha > 0;
    });

    // Chữ bay thư pháp
    this.floatingTexts = this.floatingTexts.filter(ft => {
      ft.y += ft.vy;
      ft.alpha -= 0.018;
      return ft.alpha > 0;
    });

    // Sương mây trôi lững lờ
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x - c.rx > this.width) {
        c.x = -c.rx;
      }
    });
  }

  render() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2 + 15;
    const isDark = this.theme === "dark";

    // 1. NỀN GIẤY DÓ CỔ (Sáng: #F3EAD7 / Tối: #121316)
    ctx.fillStyle = isDark ? "#121316" : "#F3EAD7";
    ctx.fillRect(0, 0, this.width, this.height);

    // Trăng sáng trên nền trời đêm nếu ở chế độ Dạ Mặc
    if (isDark) {
      this.renderMoon();
    }

    // Vết loang mực nhạt góc giấy
    this.renderPaperTexture();

    // 2. DÃY NÚI THỦY MẶC XA GẦN (Misty Mountain Silhouettes)
    this.renderMistyMountains();

    // 3. MÂY SƯƠNG TRÔI THƯ THÁI (Floating Ink Wash Mist)
    this.renderClouds();

    // 4. MỎM ĐÁ CỰ MỘC CỔ PHONG (Rock Promontory & Bamboo)
    this.renderRockPlatform(cx, cy + 45);

    // 5. TU SĨ NÉT CỌ MỰC THƯ PHÁP (Meditating Ink Cultivator)
    this.renderInkCultivator(cx, cy + 20);

    // 6. HẠT LINH KHÍ MỰC & CHU SA (Swirling Ink Qi Particles)
    this.particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = isDark && p.color === "#1A1A1A" ? "#DCE2F0" : p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 7. PHI KIẾM THỦY MẶC VÀ VỆT CỌ (Ink Flying Sword)
    this.renderInkSword(cx, cy);

    // 8. SÓNG LOANG MỰC TƯƠNG TÁC (Ink Ripples)
    this.inkRipples.forEach(r => {
      ctx.save();
      ctx.strokeStyle = isDark && r.color === "#1A1A1A" ? "#C8D2E6" : r.color;
      ctx.lineWidth = r.isSlash ? r.lineWidth : 1.5;
      ctx.globalAlpha = r.alpha;
      ctx.beginPath();
      if (r.isSlash) {
        ctx.ellipse(r.x, r.y, r.radius * 1.5, r.radius * 0.35, -0.3, 0, Math.PI * 2);
      } else {
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();
    });

    // 9. CHỮ THƯ PHÁP BAY (Floating Calligraphy)
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.font = "bold 13px 'Noto Serif', 'Be Vietnam Pro', serif";
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.textAlign = "center";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  // Vẽ vầng trăng thanh tao trong chế độ Dạ Mặc
  renderMoon() {
    const ctx = this.ctx;
    const mx = this.width * 0.82;
    const my = this.height * 0.22;

    ctx.save();
    // Hào quang trăng
    const moonHalo = ctx.createRadialGradient(mx, my, 2, mx, my, 40);
    moonHalo.addColorStop(0, "rgba(245, 248, 255, 0.45)");
    moonHalo.addColorStop(0.4, "rgba(210, 225, 255, 0.2)");
    moonHalo.addColorStop(1, "rgba(18, 19, 22, 0)");
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.fill();

    // Vầng trăng ngọc
    ctx.fillStyle = "#FAF7EE";
    ctx.beginPath();
    ctx.arc(mx, my, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Kết cấu giấy dó và loang mực nhẹ
  renderPaperTexture() {
    const ctx = this.ctx;
    const isDark = this.theme === "dark";
    ctx.save();
    // Vết loang mực mờ góc trên trái
    const gradTL = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
    gradTL.addColorStop(0, isDark ? "rgba(217, 56, 41, 0.08)" : "rgba(26, 26, 26, 0.07)");
    gradTL.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradTL;
    ctx.fillRect(0, 0, 200, 200);

    // Vết loang mực mờ góc dưới phải
    const gradBR = ctx.createRadialGradient(this.width, this.height, 10, this.width, this.height, 220);
    gradBR.addColorStop(0, isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(26, 26, 26, 0.08)");
    gradBR.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradBR;
    ctx.fillRect(this.width - 240, this.height - 240, 240, 240);
    ctx.restore();
  }

  // Vẽ dãy núi thủy mặc 3 tầng
  renderMistyMountains() {
    const ctx = this.ctx;
    const isDark = this.theme === "dark";

    // Tầng 1: Núi xa xăm mờ ảo nhất
    ctx.save();
    ctx.fillStyle = isDark ? "rgba(180, 195, 225, 0.07)" : "rgba(40, 40, 40, 0.07)";
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.65);
    ctx.quadraticCurveTo(this.width * 0.15, this.height * 0.25, this.width * 0.35, this.height * 0.55);
    ctx.quadraticCurveTo(this.width * 0.55, this.height * 0.2, this.width * 0.75, this.height * 0.5);
    ctx.quadraticCurveTo(this.width * 0.9, this.height * 0.3, this.width, this.height * 0.6);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Tầng 2: Núi trung cảnh
    ctx.save();
    ctx.fillStyle = isDark ? "rgba(160, 180, 215, 0.13)" : "rgba(30, 30, 30, 0.12)";
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.75);
    ctx.quadraticCurveTo(this.width * 0.2, this.height * 0.45, this.width * 0.45, this.height * 0.7);
    ctx.quadraticCurveTo(this.width * 0.68, this.height * 0.38, this.width * 0.88, this.height * 0.68);
    ctx.lineTo(this.width, this.height * 0.72);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Vài cánh chim nhạn mực lượn trên núi xa
    this.renderFlyingBirds();
  }

  // Đàn nhạn mực bay phương xa
  renderFlyingBirds() {
    const ctx = this.ctx;
    const isDark = this.theme === "dark";
    ctx.save();
    ctx.strokeStyle = isDark ? "rgba(220, 230, 250, 0.4)" : "rgba(26, 26, 26, 0.35)";
    ctx.lineWidth = 1;
    const birds = [
      { x: this.width * 0.25, y: this.height * 0.28, s: 4 },
      { x: this.width * 0.29, y: this.height * 0.24, s: 5 },
      { x: this.width * 0.33, y: this.height * 0.27, s: 3.5 }
    ];
    birds.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(b.x - b.s, b.y + b.s * 0.3);
      ctx.quadraticCurveTo(b.x - b.s * 0.5, b.y - b.s * 0.5, b.x, b.y);
      ctx.quadraticCurveTo(b.x + b.s * 0.5, b.y - b.s * 0.5, b.x + b.s, b.y + b.s * 0.3);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Mây sương thủy mặc
  renderClouds() {
    const ctx = this.ctx;
    this.clouds.forEach(c => {
      ctx.save();
      const grad = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.rx);
      grad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
      grad.addColorStop(0.6, `rgba(243, 234, 215, ${c.alpha * 0.7})`);
      grad.addColorStop(1, "rgba(243, 234, 215, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // Mỏm đá cổ phong nơi tu sĩ tọa thiền
  renderRockPlatform(cx, cy) {
    const ctx = this.ctx;
    ctx.save();
    // Nét cọ đá đậm
    ctx.fillStyle = "#1E1E1E";
    ctx.beginPath();
    ctx.moveTo(cx - 100, cy + 20);
    ctx.quadraticCurveTo(cx - 60, cy - 8, cx, cy - 10);
    ctx.quadraticCurveTo(cx + 60, cy - 8, cx + 100, cy + 20);
    ctx.lineTo(cx + 85, cy + 45);
    ctx.quadraticCurveTo(cx, cy + 35, cx - 85, cy + 45);
    ctx.closePath();
    ctx.fill();

    // Vệt xước mực khô (Dry brush texture)
    ctx.strokeStyle = "rgba(243, 234, 215, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy + 5);
    ctx.lineTo(cx - 20, cy);
    ctx.moveTo(cx + 15, cy - 2);
    ctx.lineTo(cx + 65, cy + 6);
    ctx.stroke();

    // Khóm trúc mực nhỏ bên mỏm đá
    this.renderBambooClump(cx - 85, cy + 10);
    ctx.restore();
  }

  // Khóm trúc thủy mặc
  renderBambooClump(bx, by) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#1A1A1A";
    ctx.lineWidth = 1.5;

    // 2 thân trúc
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 4, by - 25, bx - 8, by - 55);
    ctx.moveTo(bx + 6, by);
    ctx.quadraticCurveTo(bx + 4, by - 20, bx + 2, by - 45);
    ctx.stroke();

    // Các lá trúc nhọn (nét lia bút)
    const leaves = [
      { x: bx - 8, y: by - 55, ang: -0.6 },
      { x: bx - 8, y: by - 55, ang: 0.2 },
      { x: bx - 5, y: by - 38, ang: -0.8 },
      { x: bx + 2, y: by - 45, ang: 0.5 },
      { x: bx + 4, y: by - 30, ang: -0.4 }
    ];
    leaves.forEach(l => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.ang);
      ctx.beginPath();
      ctx.ellipse(8, 0, 9, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  // ================= TU SĨ NÉT CỌ MỰC THỦY MẶC =================
  renderInkCultivator(cx, cy) {
    const ctx = this.ctx;
    const breath = Math.sin(this.time * 2.2) * 2;

    ctx.save();

    // Hào quang Đạo Tâm mực mỏng xung quanh
    const auraPulse = Math.sin(this.time * 2.5) * 4;
    const auraGrad = ctx.createRadialGradient(cx, cy - 25, 10, cx, cy - 25, 55 + auraPulse);
    auraGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    auraGrad.addColorStop(0.5, "rgba(26, 26, 26, 0.05)");
    auraGrad.addColorStop(1, "rgba(26, 26, 26, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 25, 55 + auraPulse, 0, Math.PI * 2);
    ctx.fill();

    // 1. TỌA THIỀN KIẾT GIÀ - VẠT ÁO DƯỚI (Broad brushstroke legs)
    ctx.fillStyle = "#1A1A1A";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 48, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nếp gấp tà áo xám mực
    ctx.strokeStyle = "#4A4A4A";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy + 6);
    ctx.quadraticCurveTo(cx, cy + 14, cx + 36, cy + 6);
    ctx.stroke();

    // 2. THÂN MÌNH & ĐẠO BÀO (Cultivator Robe)
    ctx.fillStyle = "#222222";
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 6);
    ctx.quadraticCurveTo(cx - 25, cy - 18 + breath, cx - 18, cy - 35 + breath);
    ctx.lineTo(cx + 18, cy - 35 + breath);
    ctx.quadraticCurveTo(cx + 25, cy - 18 + breath, cx + 22, cy + 6);
    ctx.closePath();
    ctx.fill();

    // Vạt áo chéo chữ V màu trắng ngà
    ctx.fillStyle = "#FAF4EB";
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 35 + breath);
    ctx.lineTo(cx, cy - 14 + breath);
    ctx.lineTo(cx + 6, cy - 35 + breath);
    ctx.closePath();
    ctx.fill();

    // ĐIỂM NHẤN DUY NHẤT: DÂY LƯNG CHU SA ĐỎ SON (Vermilion Sash)
    ctx.fillStyle = "#B3261E";
    ctx.fillRect(cx - 16, cy - 4 + breath, 32, 4.5);

    // Dải lụa đỏ buông thõng
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 2 + breath);
    ctx.quadraticCurveTo(cx - 5, cy + 12 + breath, cx - 3, cy + 20 + breath);
    ctx.lineTo(cx + 1, cy + 20 + breath);
    ctx.quadraticCurveTo(cx - 1, cy + 12 + breath, cx + 2, cy - 2 + breath);
    ctx.closePath();
    ctx.fill();

    // 3. TAY KẾT ẤN ĐỊNH TÂM (Hands in Meditation Mudra)
    ctx.fillStyle = "#EAD9BE"; // Nước da giấy dó ấm
    ctx.beginPath();
    ctx.ellipse(cx, cy - 1 + breath, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 4. CỔ & ĐẦU TU SĨ (Head & Neck)
    ctx.fillStyle = "#EAD9BE";
    ctx.fillRect(cx - 4, cy - 40 + breath, 8, 7);

    // Khuôn mặt thanh tú
    ctx.beginPath();
    ctx.ellipse(cx, cy - 46 + breath, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Điểm chu sa mi tâm (Cinnabar forehead mark)
    ctx.fillStyle = "#B3261E";
    ctx.beginPath();
    ctx.arc(cx, cy - 49 + breath, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Đôi mắt khép hờ tĩnh tại (Thư thái thiền định)
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 46 + breath);
    ctx.quadraticCurveTo(cx - 4, cy - 44.5 + breath, cx - 2, cy - 46 + breath);
    ctx.moveTo(cx + 2, cy - 46 + breath);
    ctx.quadraticCurveTo(cx + 4, cy - 44.5 + breath, cx + 6, cy - 46 + breath);
    ctx.stroke();

    // 5. MÁI TÓC BÚI CAO & TRÂM GỖ (Topknot Hair & Wooden Pin)
    ctx.fillStyle = "#111111";
    // Mái tóc rủ hai bên
    ctx.beginPath();
    ctx.arc(cx, cy - 48 + breath, 10.5, Math.PI, 0);
    ctx.fill();

    // Búi tóc đạo gia
    ctx.beginPath();
    ctx.arc(cx, cy - 60 + breath, 6, 0, Math.PI * 2);
    ctx.fill();

    // Cây trâm cài ngang
    ctx.strokeStyle = "#B3261E"; // Trâm son đỏ tao nhã
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 60 + breath);
    ctx.lineTo(cx + 12, cy - 60 + breath);
    ctx.stroke();

    ctx.restore();
  }

  // ================= PHI KIẾM THỦY MẶC =================
  renderInkSword(cx, cy) {
    const ctx = this.ctx;
    const isDark = this.theme === "dark";

    // Vệt mực loang theo đuôi phi kiếm
    for (let i = 0; i < this.sword.trail.length - 1; i++) {
      const p1 = this.sword.trail[i];
      const p2 = this.sword.trail[i + 1];
      ctx.save();
      ctx.strokeStyle = isDark ? "#D8E2F8" : "#1A1A1A";
      ctx.lineWidth = (1 - i / this.sword.trail.length) * 3;
      ctx.globalAlpha = p1.alpha * (isDark ? 0.35 : 0.45);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }

    if (this.sword.trail.length > 0) {
      const cur = this.sword.trail[0];
      ctx.save();
      ctx.translate(cur.x, cur.y);
      ctx.rotate(this.sword.angle + Math.PI / 2);

      // Thân kiếm mực đen / kiếm bạc dạ nguyệt
      ctx.fillStyle = isDark ? "#F0F4FF" : "#1A1A1A";
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(2.5, 4);
      ctx.lineTo(0, 8);
      ctx.lineTo(-2.5, 4);
      ctx.closePath();
      ctx.fill();

      // Chuôi kiếm có tua chỉ đỏ son
      ctx.fillStyle = isDark ? "#D93829" : "#B3261E";
      ctx.fillRect(-1, 8, 2, 4);
      ctx.beginPath();
      ctx.arc(0, 13, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}

// Khởi tạo global instance
window.DongPhu2D = DongPhu2DEngine;
