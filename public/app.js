// public/app.js - Logic điều khiển Frontend Tu Chân Giới
// Nâng cấp: Hiệu suất thiền định decay, Bãi săn tự do ngẫu nhiên, Yêu Đan, Công Pháp, Huyết Thú, Đài Độ Kiếp, Tụ Linh Đỉnh, 2D Canvas Động Phủ
let currentChar = null;
let currentStats = null;
let huntingZones = [];
let selectedGarden = "DAN";
let selectedZoneIndex = 0;
let socket = null;
let wellInterval = null;
let dongPhuEngine = null;

// Element icons
const ELEMENT_ICONS = {
  "Kim": "⚔️",
  "Mộc": "🌿",
  "Thủy": "💧",
  "Hỏa": "🔥",
  "Thổ": "🏔️"
};

// Item labels & metadata
const ITEM_META = {
  "thao_duoc_linh_chi": { name: "Thảo Dược Linh Chi", icon: "🍄", desc: "Dược liệu cơ bản luyện đan." },
  "thao_duoc_hoang_tinh": { name: "Hoàng Tinh Thảo", icon: "🌾", desc: "Dược liệu bổ sung nguyên khí." },
  "thao_duoc_quy_hiem": { name: "Thất Tinh Thảo Quý", icon: "✨", desc: "Linh thảo ngàn năm cực kỳ hiếm có." },
  "nuoc_linh_khi": { name: "Nước Linh Khí", icon: "🧪", desc: "Múc từ Giếng Linh Tuyền, tưới điền hoặc luyện đan." },

  // Đan dược
  "dan_the_luc": { name: "Thể Lực Đan", icon: "⚡", desc: "Hồi phục ngay +50 Thể Lực.", usable: true },
  "dan_hoi_mau": { name: "Hồi Huyết Đan", icon: "❤️", desc: "Hồi phục toàn bộ sinh mệnh khi bị thương.", usable: true },
  "dan_ho_mach": { name: "Hộ Mạch Đan", icon: "🛡️", desc: "Tạo lá chắn giảm 40% sát thương Lôi Kiếp khi Độ Kiếp.", usable: false },
  "dan_tu_khi": { name: "Tụ Khí Đan", icon: "💊", desc: "Hấp thu lập tức +500 Tu Vi.", usable: true },
  "dan_truc_co": { name: "Trúc Cơ Linh Đan", icon: "✨", desc: "Hấp thu lập tức +3,000 Tu Vi.", usable: true },
  "dan_tu_nguyen": { name: "Kim Đan Tụ Nguyên Đan", icon: "🔮", desc: "Hấp thu lập tức +15,000 Tu Vi.", usable: true },
  "dan_hoa_anh": { name: "Hóa Anh Đan", icon: "🌟", desc: "Bộc phát lập tức +50,000 Tu Vi!", usable: true },

  // Yêu Đan các giai
  "yeu_dan_1": { name: "Yêu Đan Giai 1", icon: "🔵", desc: "Luyện hóa nhận +200 Tu Vi hoặc chế Tụ Khí Đan.", usable: true },
  "yeu_dan_2": { name: "Yêu Đan Giai 2", icon: "🟢", desc: "Luyện hóa nhận +1,000 Tu Vi hoặc chế Trúc Cơ Đan.", usable: true },
  "yeu_dan_3": { name: "Yêu Đan Giai 3", icon: "🟣", desc: "Luyện hóa nhận +5,000 Tu Vi hoặc chế Tụ Nguyên Đan.", usable: true },
  "yeu_dan_4": { name: "Yêu Đan Giai 4", icon: "🔴", desc: "Luyện hóa nhận +20,000 Tu Vi.", usable: true },
  "yeu_dan_5": { name: "Yêu Đan Giai 5", icon: "🟡", desc: "Luyện hóa nhận +80,000 Tu Vi.", usable: true },

  // Công pháp bí tịch
  "cong_phap_kiem_quyet": { name: "Thái Hư Kiếm Quyết", icon: "🗡️", desc: "Bí tịch kiếm đạo, tăng vĩnh viễn +15% Công Kích.", isSkill: true },
  "cong_phap_bat_hoai": { name: "Kim Cương Bất Hoại Thân", icon: "🛡️", desc: "Bí tịch thối thể, tăng +20% Thủ & +10% Kháng Lôi Kiếp.", isSkill: true },
  "cong_phap_huyen_bo": { name: "Thiên Lôi Huyễn Bộ", icon: "⚡", desc: "Thân pháp bí tịch, tăng +15 Thân Pháp & +5% Né Tránh.", isSkill: true },
  "cong_phap_hoa_kinh": { name: "Bát Hoang Liệt Hỏa Kinh", icon: "🔥", desc: "Chân hỏa công pháp, tăng +25% sát thương Hỏa.", isSkill: true },

  // Huyết thú tinh hoa
  "huyet_thu_ma_lang": { name: "Huyết Thú Ma Lang", icon: "🩸", desc: "Luyện hóa tăng +15% HP và +5% Hút Máu.", isBloodline: true },
  "huyet_thu_hung_vuong": { name: "Huyết Thú Cự Hùng", icon: "🐻", desc: "Luyện hóa tăng +30% HP và giảm 10% sát thương.", isBloodline: true },
  "huyet_thu_thai_co": { name: "Huyết Thú Thái Cổ", icon: "🐉", desc: "Chân long tinh huyết, tăng +50% HP và giảm 25% sát thương Lôi Kiếp!", isBloodline: true }
};

// Chủng Tộc Metadata & Buff/Debuff Mô Tả
const RACE_DETAILS = {
  "Nhan": {
    name: "Nhân Tộc",
    symbol: "☯️",
    color: "#38bdf8",
    elem: "Linh Khí",
    desc: "Vạn Đạo Ngộ Tính, bách gia toàn năng, nghịch thiên cải mệnh.",
    buff: "Buff: Tọa thiền +15% Tu vi/s, tiết kiệm 10% luyện đan, học công pháp +25% chỉ số",
    debuff: "Debuff: Phàm thai sơ khởi, thọ mệnh hạn hẹp (quá 180s đầy exp hao hụt nhẹ)"
  },
  "Tien": {
    name: "Tiên Tộc",
    symbol: "👑",
    color: "#facc15",
    elem: "Tiên Khí",
    desc: "Bẩm Sinh Tiên Cốt, xuất trần thanh khiết, ngạo thị quần hùng.",
    buff: "Buff: Chỉ số gốc toàn diện +8%, Tiên Uy giảm 5% sát thương từ Ma/Yêu",
    debuff: "Debuff: Máu <20% Tiên khí tán loạn giảm -10% Công, đột phá tốn +20% Linh Thạch"
  },
  "Ma": {
    name: "Ma Tộc",
    symbol: "⚔️",
    color: "#f87171",
    elem: "Ma Khí",
    desc: "Thôn Phệ Sát Lực, cuồng ma huyết nộ, sát phạt quả đoán.",
    buff: "Buff: Săn quái +15% Tu Vi, có sẵn 5% Hút Máu, Cuồng Nộ bộc phát",
    debuff: "Debuff: Lôi Kiếp +15% sát thương, bài xích linh đan chính đạo (-15% hiệu quả)"
  },
  "Yeu": {
    name: "Yêu Tộc",
    symbol: "🐉",
    color: "#4ade80",
    elem: "Yêu Lực",
    desc: "Thái Cổ Thần Khu, da dày vảy cứng, nhục thân bất diệt.",
    buff: "Buff: Khí Huyết +15%, Giáp +10%, hồi 1% HP/hiệp, giảm 10% sát thương Lôi Kiếp",
    debuff: "Debuff: Tọa thiền giảm -15% Tu vi/s, thân hình cồng kềnh -3 Thân Pháp"
  },
  "Minh": {
    name: "Minh Tộc",
    symbol: "👻",
    color: "#c084fc",
    elem: "Hồn Lực",
    desc: "Hư Ảnh Vô Tung, toái hồn bạo kích, du đãng cửu tuyền.",
    buff: "Buff: Thân Pháp +6 Speed, 8% Né Tránh tuyệt đối, Bạo Kích +8%",
    debuff: "Debuff: Khí Huyết giấy (-10% Max HP), nhận +15% sát thương từ Hỏa công"
  }
};

// ================= 0. GIAO DIỆN SÁNG / TỐI (THEME MANAGER) =================
function initTheme() {
  const savedTheme = localStorage.getItem("tu_tien_theme") || "light";
  applyTheme(savedTheme);

  const btnToggle = document.getElementById("btn-toggle-theme");
  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("tu_tien_theme", next);
    });
  }
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");

  if (theme === "dark") {
    if (themeIcon) themeIcon.className = "fa-solid fa-sun text-yellow-400";
    if (themeText) themeText.textContent = "Bạch Trú";
  } else {
    if (themeIcon) themeIcon.className = "fa-solid fa-moon text-[#1A1A1A]";
    if (themeText) themeText.textContent = "Dạ Mặc";
  }

  if (dongPhuEngine && typeof dongPhuEngine.setTheme === "function") {
    dongPhuEngine.setTheme(theme);
  }
}

// ================= 0.1 THIÊN ĐẠO LINH THƯ THÔNG BÁO (XIANXIA POPUP MODAL) =================
function showXianxiaPopup(message, options = {}) {
  const modal = document.getElementById("xianxia-popup-modal");
  const card = document.getElementById("xianxia-popup-card");
  const iconEl = document.getElementById("xianxia-popup-icon");
  const iconBox = document.getElementById("xianxia-popup-icon-box");
  const titleEl = document.getElementById("xianxia-popup-title");
  const msgEl = document.getElementById("xianxia-popup-message");
  const btnText = document.getElementById("xianxia-popup-btn-text");
  const confirmBtn = document.getElementById("xianxia-popup-confirm-btn");

  if (!modal || !card) {
    console.log("Xianxia Notice:", message);
    return;
  }

  // Tự động phân tích ngữ cảnh để đặt Tiêu đề, Biểu tượng và Nút bấm đẹp nhất
  let title = options.title || "Thiên Đạo Báo Tin";
  let icon = options.icon || "📜";
  let btn = options.buttonText || "Lĩnh Nhận";

  const msgLower = (message || "").toLowerCase();

  if (msgLower.includes("luyện chế thành công") || msgLower.includes("luyện đan") || msgLower.includes("đan")) {
    title = "Luyện Đan Xuất Lô";
    icon = "💊";
    btn = "Lĩnh Nhận";
  } else if (msgLower.includes("lỗi") || msgLower.includes("thất bại") || msgLower.includes("không đủ") || msgLower.includes("chưa đủ")) {
    title = "Thiên Đạo Nhắc Nhở";
    icon = "⚠️";
    btn = "Đã Rõ";
  } else if (msgLower.includes("độ kiếp") || msgLower.includes("lôi kiếp") || msgLower.includes("sát thương lôi")) {
    title = "Thiên Kiếp Lôi Đình";
    icon = "⚡";
    btn = "Tiếp Tục";
  } else if (msgLower.includes("đột phá") || msgLower.includes("cảnh giới")) {
    title = "Cảnh Giới Thăng Hoa";
    icon = "🌟";
    btn = "Tạ Ơn";
  } else if (msgLower.includes("hồi phục") || msgLower.includes("khí huyết") || msgLower.includes("hồi máu")) {
    title = "Diệu Thủ Hồi Xuân";
    icon = "💖";
    btn = "Thu Nhận";
  } else if (msgLower.includes("tẩy tủy") || msgLower.includes("thể chất")) {
    title = "Tẩy Tủy Hoán Cốt";
    icon = "✨";
    btn = "Tiếp Nhận";
  } else if (msgLower.includes("tẩy uế") || msgLower.includes("đan độc")) {
    title = "Bế Quan Tẩy Uế";
    icon = "🍃";
    btn = "Xác Nhận";
  } else if (msgLower.includes("múc nước") || msgLower.includes("linh điền") || msgLower.includes("thu hoạch")) {
    title = "Linh Điền Bội Thu";
    icon = "🌱";
    btn = "Thu Hoạch";
  } else if (msgLower.includes("chiến thắng") || msgLower.includes("diệt quái") || msgLower.includes("hạ gục")) {
    title = "Trảm Yêu Đại Thắng";
    icon = "⚔️";
    btn = "Thu Hoạch";
  } else if (msgLower.includes("trích xuất") || msgLower.includes("tụ linh đỉnh")) {
    title = "Tụ Linh Đại Trận";
    icon = "⚱️";
    btn = "Hấp Thu";
  }

  if (titleEl) titleEl.textContent = title;
  if (iconEl) iconEl.textContent = icon;
  if (msgEl) msgEl.textContent = message;
  if (btnText) btnText.textContent = btn;

  // Hiển thị modal với hoạt ảnh mượt mà
  modal.classList.remove("hidden");
  requestAnimationFrame(() => {
    card.classList.remove("scale-95");
    card.classList.add("scale-100");
  });

  const closeModal = () => {
    card.classList.remove("scale-100");
    card.classList.add("scale-95");
    setTimeout(() => {
      modal.classList.add("hidden");
      if (typeof options.onClose === "function") {
        options.onClose();
      }
    }, 150);
    document.removeEventListener("keydown", handleKeydown);
  };

  const handleKeydown = (e) => {
    if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
      e.preventDefault();
      closeModal();
    }
  };

  if (confirmBtn) confirmBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  document.addEventListener("keydown", handleKeydown);
}

// Thay thế toàn bộ alert() mặc định của trình duyệt bằng Thiên Đạo Popup Cổ Phong
window.alert = function(msg) {
  showXianxiaPopup(msg);
};

// ================= 1. KHỞI CHẠY & AUTHENTICATION =================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTabs();
  initSocket();

  // Khởi tạo Động Cơ Động Phủ 2D Canvas Engine
  if (window.DongPhu2D) {
    dongPhuEngine = new window.DongPhu2D("dongphu-canvas-2d");
    const currentTheme = document.body.getAttribute("data-theme") || "light";
    if (typeof dongPhuEngine.setTheme === "function") {
      dongPhuEngine.setTheme(currentTheme);
    }
    const btnSlash = document.getElementById("btn-dongphu-slash");
    if (btnSlash) {
      btnSlash.addEventListener("click", () => {
        if (dongPhuEngine) dongPhuEngine.triggerSwordSlash();
      });
    }
    const btnBoost = document.getElementById("btn-dongphu-boost");
    if (btnBoost) {
      btnBoost.addEventListener("click", () => {
        if (dongPhuEngine) dongPhuEngine.boostQi();
      });
    }
  }

  // Setup click chọn tộc trong modal đăng ký
  document.querySelectorAll(".race-select-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".race-select-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      const race = card.getAttribute("data-race") || "Nhan";
      const raceInput = document.getElementById("login-race");
      if (raceInput) raceInput.value = race;

      const rInfo = RACE_DETAILS[race];
      const detailEl = document.getElementById("race-desc-detail");
      if (rInfo && detailEl) {
        detailEl.innerHTML = `
          ${rInfo.symbol} <strong>${rInfo.name}</strong> (${rInfo.elem}): ${rInfo.desc}<br>
          <span class="text-[#2A6E3B] font-bold">${rInfo.buff}</span><br>
          <span class="text-[#B3261E] font-bold">${rInfo.debuff}</span>
        `;
      }
    });
  });

  const savedName = localStorage.getItem("tutien_character_name");
  if (savedName) {
    loadCharacter(savedName);
  } else {
    showLoginModal();
  }

  // Setup form đăng nhập
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("login-name").value.trim();
    if (!nameInput) return;

    const raceInput = document.getElementById("login-race");
    const chosenRace = raceInput ? raceInput.value : "Nhan";

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput, race: chosenRace })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("tutien_character_name", data.character.name);
        currentChar = data.character;
        currentStats = data.stats;
        if (data.huntingZones) huntingZones = data.huntingZones;
        hideLoginModal();
        joinSocketWorld(currentChar.name);
        updateUI();
      } else {
        alert(data.error || "Không thể đăng nhập!");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    }
  });

  // Đổi đạo hiệu (Logout)
  document.getElementById("btn-logout").addEventListener("click", () => {
    if (confirm("Đạo hữu có chắc muốn tạm xuất hồn (đổi Đạo Hiệu) không?")) {
      localStorage.removeItem("tutien_character_name");
      currentChar = null;
      showLoginModal();
    }
  });

  setupEventHandlers();
});

function showLoginModal() {
  document.getElementById("login-modal").classList.remove("hidden");
}
function hideLoginModal() {
  document.getElementById("login-modal").classList.add("hidden");
}

// ================= 2. QUẢN LÝ KẾT NỐI REALTIME (SOCKET.IO) =================
function initSocket() {
  socket = io();

  socket.on("connect", () => {
    console.log("🌌 Đã kết nối với Thiên Đạo (Socket.io)!");
    if (currentChar) {
      joinSocketWorld(currentChar.name);
    }
  });

  socket.on("world:online_users", (users) => {
    const countEl = document.getElementById("online-count");
    const badgeEl = document.getElementById("online-badge");
    const listEl = document.getElementById("online-players-list");

    const countText = `${users.length} Đạo Hữu Trực Tuyến`;
    if (countEl) countEl.innerText = countText;
    if (badgeEl) badgeEl.innerText = `${users.length} online`;

    if (listEl) {
      listEl.innerHTML = users.map(u => `
        <div class="flex items-center justify-between py-1 text-xs text-[#1A1A1A] border-b border-[rgba(26,26,26,0.06)] last:border-none">
          <span class="flex items-center gap-1.5 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-[#B3261E] animate-pulse"></span>
            ${escapeHtml(u)}
          </span>
          ${u === (currentChar && currentChar.name) ? '<span class="seal-stamp text-[9px] py-0.2 px-1">(Bản Thể)</span>' : ''}
        </div>
      `).join("");
    }
  });

  // Cập nhật tu vi và thể lực theo nhịp 1s
  socket.on("character:tick", (tickData) => {
    if (!currentChar) return;
    currentChar.exp = tickData.exp;
    currentChar.stamina = tickData.stamina;
    currentChar.currentHp = tickData.currentHp;
    if (tickData.gardens) currentChar.gardens = tickData.gardens;
    if (tickData.spiritReservoir) currentChar.spiritReservoir = tickData.spiritReservoir;
    if (tickData.foundation) currentChar.foundation = tickData.foundation;
    if (tickData.expPerSec && currentStats) currentStats.expPerSec = tickData.expPerSec;
    if (tickData.meditationEff && currentStats) currentStats.meditationEff = tickData.meditationEff;
    if (typeof tickData.pillToxins === "number" && currentStats) currentStats.pillToxins = tickData.pillToxins;
    if (typeof tickData.foundationStability === "number" && currentStats) currentStats.foundationStability = tickData.foundationStability;

    updateTopExpBar();
    updateCultivationTab();
    updateFoundationUI();
    if (selectedGarden && currentChar.gardens) {
      renderGardenPlots();
    }
  });

  socket.on("chat:history", (messages) => {
    const container = document.getElementById("chat-messages-container");
    container.innerHTML = "";
    messages.forEach(msg => appendChatMessage(msg));
    scrollChatToBottom();
  });

  socket.on("chat:new_message", (msg) => {
    appendChatMessage(msg);
    scrollChatToBottom();
    notifyNewChatMessage();
  });

  socket.on("chat:system", (data) => {
    appendSystemNotice(data.text);
    scrollChatToBottom();
    notifyNewChatMessage();
  });

  socket.on("boss:sync", (boss) => {
    updateBossUI(boss);
  });

  socket.on("boss:damaged", (data) => {
    updateBossUI({
      name: data.bossName,
      currentHp: data.currentHp,
      maxHp: data.maxHp,
      isAlive: true,
      dpsTable: data.dpsTable
    });

    if (currentChar && data.attacker === currentChar.name) {
      showBossFloatingDamage(data.damage);
    }
  });

  socket.on("boss:defeated", (data) => {
    updateBossUI(data.boss);
  });

  socket.on("boss:respawn", (data) => {
    updateBossUI(data.boss);
  });
}

function joinSocketWorld(name) {
  if (socket && socket.connected) {
    socket.emit("world:join", { name });
  }
}

// ================= 3. TẢI VÀ ĐỒNG BỘ DỮ LIỆU NHÂN VẬT =================
async function loadCharacter(name) {
  try {
    const res = await fetch(`/api/character?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (data.character) {
      currentChar = data.character;
      currentStats = data.stats;
      if (data.huntingZones) huntingZones = data.huntingZones;
      hideLoginModal();
      joinSocketWorld(currentChar.name);
      updateUI();
    } else {
      showLoginModal();
    }
  } catch (err) {
    console.error("Lỗi tải thông tin nhân vật:", err);
    showLoginModal();
  }
}

// ================= 4. CẬP NHẬT GIAO DIỆN CHÍNH (UI) =================
function updateUI() {
  if (!currentChar || !currentStats) return;

  // Cập nhật trạng thái đồ họa Động Phủ 2D
  if (dongPhuEngine) {
    dongPhuEngine.updateState(currentChar, currentStats);
  }

  // 1. Top Header
  document.getElementById("top-name").innerText = currentChar.name;
  document.getElementById("top-element").innerText = currentChar.element;
  document.getElementById("top-realm").innerText = currentStats.realmName;
  document.getElementById("top-stamina").innerText = `${currentChar.stamina}/${currentChar.maxStamina}`;
  document.getElementById("top-hp").innerText = `${currentChar.currentHp}/${currentStats.hp}`;
  document.getElementById("top-stones").innerText = currentChar.spiritStones.toLocaleString();

  updateTopExpBar();

  // 2. Left Sidebar Summary
  document.getElementById("side-name").innerText = currentChar.name;
  document.getElementById("side-element-icon").innerText = ELEMENT_ICONS[currentChar.element] || "🔥";
  document.getElementById("side-physique-badge").innerText = currentChar.physique;

  document.getElementById("stat-atk").innerText = currentStats.atk.toLocaleString();
  document.getElementById("stat-def").innerText = currentStats.def.toLocaleString();
  document.getElementById("stat-hp").innerText = currentStats.hp.toLocaleString();
  document.getElementById("stat-speed").innerText = currentStats.speed;

  const storedExp = (currentChar.spiritReservoir && currentChar.spiritReservoir.storedExp) || 0;
  document.getElementById("side-reservoir-text").innerText = `${Math.floor(storedExp).toLocaleString()} Tu Vi`;

  // 3. Căn Cơ, Đan Độc & Linh Căn
  updateFoundationUI();

  // 4. Tab Tọa Thiền
  updateCultivationTab();

  // 5. Tab Nông Trại
  renderGardenPlots();
  checkWellCooldown();

  // 6. Tab Lịch Luyện Săn Quái
  renderHuntingZonesSelect();
  renderWildScoutedMonster();

  // 7. Tab Túi Càn Khôn, Công Pháp & Huyết Thú
  renderInventory();
  renderSkillsAndBloodlines();
}

// Cập nhật chi tiết Căn Cơ, Đan Độc, Chủng Tộc và Linh Căn
function updateFoundationUI() {
  if (!currentChar || !currentStats) return;

  const rKey = currentChar.race || "Nhan";
  const rInfo = RACE_DETAILS[rKey] || RACE_DETAILS["Nhan"];

  // 1. Top Header Badges
  const topRaceEl = document.getElementById("top-race-badge");
  if (topRaceEl) {
    topRaceEl.innerText = `${rInfo.symbol} ${rInfo.name}`;
    topRaceEl.title = `${rInfo.buff}\n${rInfo.debuff}`;
  }

  const rootEl = document.getElementById("top-root-badge");
  if (rootEl) {
    rootEl.innerText = currentStats.rootName || "Chân Linh Căn";
  }

  const aptEl = document.getElementById("top-aptitude-badge");
  if (aptEl) {
    aptEl.innerText = currentStats.aptitudeRank || "Trung Phẩm";
  }

  const stability = (currentChar.foundation && typeof currentChar.foundation.stability === "number") ? currentChar.foundation.stability : 100;
  const toxins = (currentChar.foundation && typeof currentChar.foundation.pillToxins === "number") ? currentChar.foundation.pillToxins : 0;
  const grade = (currentChar.foundation && currentChar.foundation.grade) || "Phàm Phẩm Trúc Cơ";

  const topStabEl = document.getElementById("top-stability-text");
  if (topStabEl) topStabEl.innerText = `${stability}%`;

  const topToxEl = document.getElementById("top-toxin-text");
  if (topToxEl) {
    topToxEl.innerText = `${toxins}%`;
    if (toxins >= 80) {
      topToxEl.className = "font-black text-[#B3261E] animate-pulse";
    } else if (toxins >= 30) {
      topToxEl.className = "font-bold text-[#B3261E]";
    } else {
      topToxEl.className = "font-bold text-[#1A1A1A]";
    }
  }

  // 2. Left Sidebar Summary
  const sideRaceEl = document.getElementById("side-race-badge");
  if (sideRaceEl) sideRaceEl.innerText = `${rInfo.symbol} ${rInfo.name}`;

  const sideRootEl = document.getElementById("side-root-badge");
  if (sideRootEl) sideRootEl.innerText = currentStats.rootName || "Chân Linh Căn";

  const sideAptEl = document.getElementById("side-aptitude-badge");
  if (sideAptEl) sideAptEl.innerText = currentStats.aptitudeRank || "Trung Phẩm";

  const sideGradeEl = document.getElementById("side-foundation-grade");
  if (sideGradeEl) sideGradeEl.innerText = grade;

  const sideStabVal = document.getElementById("side-stability-val");
  const sideStabBar = document.getElementById("side-stability-bar");
  if (sideStabVal) {
    let stabLabel = stability >= 85 ? "Kim Cương Đạo Cơ" : (stability >= 50 ? "Ổn Định" : "Hư Phù (Nguy Hiểm)");
    sideStabVal.innerText = `${stability}% (${stabLabel})`;
  }
  if (sideStabBar) {
    sideStabBar.style.width = `${stability}%`;
    sideStabBar.className = stability < 40 ? "bg-amber-500 h-full transition-all duration-300" : "bg-emerald-500 h-full transition-all duration-300";
  }

  const sideToxVal = document.getElementById("side-toxins-val");
  const sideToxBar = document.getElementById("side-toxins-bar");
  if (sideToxVal) {
    let toxLabel = toxins >= 80 ? "Đan Điền Bế Tắc!" : (toxins >= 30 ? "Nhiễm Độc" : "Thanh Khiết");
    sideToxVal.innerText = `${toxins}% (${toxLabel})`;
    sideToxVal.className = toxins >= 80 ? "font-black text-[#B3261E] animate-pulse" : (toxins >= 30 ? "font-bold text-[#B3261E]" : "font-bold text-[#1A1A1A]");
  }
  if (sideToxBar) {
    sideToxBar.style.width = `${toxins}%`;
    sideToxBar.className = toxins >= 80 ? "bg-red-500 h-full animate-pulse transition-all duration-300" : (toxins >= 30 ? "bg-amber-500 h-full transition-all duration-300" : "bg-red-500 h-full transition-all duration-300");
  }

  // 3. Tab 1 Panel
  const cultTierEl = document.getElementById("cult-tier-badge");
  if (cultTierEl) {
    const t = currentStats.tier || 1;
    const tName = t === 1 ? "Tier 1: Tân Thủ Nhập Môn" : (t === 2 ? "Tier 2: Tiểu Thành Thức Tỉnh" : "Tier 3: Đại Thành Nghịch Thiên");
    cultTierEl.innerText = tName;
  }
  const cultRaceTitle = document.getElementById("cult-race-title");
  if (cultRaceTitle) cultRaceTitle.innerText = `${rInfo.symbol} ${rInfo.name}`;
  const cultRaceElem = document.getElementById("cult-race-elem");
  if (cultRaceElem) cultRaceElem.innerText = `Khí: ${rInfo.elem}`;
  const cultRaceDesc = document.getElementById("cult-race-desc");
  if (cultRaceDesc) cultRaceDesc.innerText = rInfo.desc;
  const cultRaceBuff = document.getElementById("cult-race-buff");
  if (cultRaceBuff) cultRaceBuff.innerText = rInfo.buff;
  const cultRaceDebuff = document.getElementById("cult-race-debuff");
  if (cultRaceDebuff) cultRaceDebuff.innerText = rInfo.debuff;

  const cultRootTitle = document.getElementById("cult-root-title");
  if (cultRootTitle) cultRootTitle.innerText = `Linh Căn: ${currentStats.rootName || "Chân Linh Căn"}`;
  const cultAptTitle = document.getElementById("cult-aptitude-title");
  if (cultAptTitle) cultAptTitle.innerText = `Tư Chất: ${currentStats.aptitudeRank || "Trung Phẩm"}`;
  const cultFTitle = document.getElementById("cult-foundation-title");
  if (cultFTitle) cultFTitle.innerText = grade;
}

// Bế quan tẩy uế kinh mạch
async function handleFoundationCleanse() {
  if (!currentChar) return;
  if (currentChar.stamina < 5) {
    alert("Không đủ Thể Lực! Cần 5 Thể Lực để bế quan tẩy uế kinh mạch.");
    return;
  }

  try {
    const res = await fetch("/api/foundation/cleanse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();
      alert(data.message);
    } else {
      alert(data.error || "Không thể bế quan tẩy uế!");
    }
  } catch (err) {
    alert("Lỗi kết nối: " + err.message);
  }
}

function updateTopExpBar() {
  if (!currentChar || !currentStats) return;

  const currentExp = currentChar.exp;
  const maxExp = currentStats.maxExp;
  const pct = Math.min(100, Math.floor((currentExp / maxExp) * 100));

  const bar = document.getElementById("top-exp-bar");
  const txt = document.getElementById("top-exp-text");
  const rateTxt = document.getElementById("top-exp-rate");

  if (bar) bar.style.width = `${pct}%`;
  if (txt) txt.innerText = `${currentExp.toLocaleString()} / ${maxExp.toLocaleString()} (${pct}%)`;
  if (rateTxt) rateTxt.innerText = `+${currentStats.expPerSec}/s`;

  // Đổi trạng thái nút Độ Kiếp
  const canTribulate = currentExp >= maxExp;
  const btnTopTrib = document.getElementById("btn-top-tribulation");
  const btnModalTrib = document.getElementById("btn-open-tribulation-modal");

  [btnTopTrib, btnModalTrib].forEach(btn => {
    if (btn) {
      btn.disabled = !canTribulate;
      if (canTribulate) {
        btn.classList.add("animate-pulse", "shadow-md");
      } else {
        btn.classList.remove("animate-pulse", "shadow-md");
      }
    }
  });
}

function updateCultivationTab() {
  if (!currentChar || !currentStats) return;

  const realmTitle = document.getElementById("cult-realm-name");
  if (realmTitle) realmTitle.innerText = currentStats.realmName;

  const cultPct = Math.min(100, Math.floor((currentChar.exp / currentStats.maxExp) * 100));
  const expBar = document.getElementById("cult-exp-bar");
  const expPctTxt = document.getElementById("cult-exp-percent");
  const expDetail = document.getElementById("cult-exp-detail");
  const rateDetail = document.getElementById("cult-rate-detail");
  const effText = document.getElementById("cult-efficiency-text");

  if (expBar) expBar.style.width = `${cultPct}%`;
  if (expPctTxt) expPctTxt.innerText = `${cultPct}%`;
  if (expDetail) expDetail.innerText = `${currentChar.exp.toLocaleString()} / ${currentStats.maxExp.toLocaleString()}`;
  if (rateDetail) rateDetail.innerText = `+${currentStats.expPerSec} Tu Vi / Giây`;

  // Hiệu suất thiền định decay
  if (effText) {
    const eff = currentStats.meditationEff || 100;
    effText.innerText = `${eff}% (Mỗi tiểu cảnh -2%, đại cảnh -5%)`;
  }

  // Tụ Linh Đỉnh
  const resAmt = document.getElementById("reservoir-amount");
  const stored = (currentChar.spiritReservoir && currentChar.spiritReservoir.storedExp) || 0;
  if (resAmt) resAmt.innerText = Math.floor(stored).toLocaleString();

  // Quick pill counts
  const inv = currentChar.inventory || {};
  document.querySelectorAll(".pill-count-dan_tu_khi").forEach(el => el.innerText = `x${inv["dan_tu_khi"] || 0}`);
  document.querySelectorAll(".pill-count-dan_truc_co").forEach(el => el.innerText = `x${inv["dan_truc_co"] || 0}`);
  document.querySelectorAll(".pill-count-dan_ho_mach").forEach(el => el.innerText = `x${inv["dan_ho_mach"] || 0}`);
  document.querySelectorAll(".pill-count-dan_the_luc").forEach(el => el.innerText = `x${inv["dan_the_luc"] || 0}`);

  // Thể chất
  const physName = document.getElementById("physique-current-name");
  if (physName) physName.innerText = currentChar.physique;

  const pendingBox = document.getElementById("physique-pending-box");
  if (currentChar.physiquePending) {
    pendingBox.classList.remove("hidden");
    document.getElementById("physique-pending-name").innerText = currentChar.physiquePending;
  } else {
    pendingBox.classList.add("hidden");
  }
}

// ================= 5. BÃI SĂN LỊCH LUYỆN (SAFE & WILD) =================
function renderHuntingZonesSelect() {
  const select = document.getElementById("select-hunting-zone");
  if (!select || huntingZones.length === 0) return;

  select.innerHTML = huntingZones.map((z, idx) => `
    <option value="${idx}" ${idx === selectedZoneIndex ? 'selected' : ''} ${currentChar.realmId < z.minRealm ? 'disabled' : ''}>
      ${z.name} ${currentChar.realmId < z.minRealm ? '(Cần Cấp Cao Hơn)' : ''}
    </option>
  `).join("");

  updateSafeMonsterDisplay();
}

function updateSafeMonsterDisplay() {
  const zone = huntingZones[selectedZoneIndex];
  if (!zone) return;

  const monster = zone.monsters[0] || {};
  document.getElementById("safe-monster-icon").innerText = monster.icon || "🐺";
  document.getElementById("safe-monster-name").innerText = monster.name || "Yêu Thú";
  document.getElementById("safe-monster-elem").innerText = `Hệ ${monster.element || 'Hỏa'}`;
  document.getElementById("safe-monster-hp").innerText = (monster.hp || 0).toLocaleString();
  document.getElementById("safe-monster-atk").innerText = (monster.atk || 0).toLocaleString();
  document.getElementById("safe-monster-def").innerText = (monster.def || 0).toLocaleString();
}

function renderWildScoutedMonster() {
  const box = document.getElementById("wild-scout-box");
  const empty = document.getElementById("wild-scout-empty");
  const monster = currentChar ? currentChar.currentWildMonster : null;

  if (!monster) {
    if (box) box.classList.add("hidden");
    if (empty) empty.classList.remove("hidden");
    return;
  }

  if (box) box.classList.remove("hidden");
  if (empty) empty.classList.add("hidden");

  document.getElementById("wild-monster-name").innerText = monster.name;
  const badge = document.getElementById("wild-monster-badge");
  badge.innerText = monster.prefix;

  if (monster.prefix === "Thường") badge.className = "badge-thuong text-xs px-2.5 py-0.5 rounded font-black";
  else if (monster.prefix === "Tinh Anh") badge.className = "badge-tinhanh text-xs px-2.5 py-0.5 rounded font-black";
  else if (monster.prefix === "Biến Dị") badge.className = "badge-biendi text-xs px-2.5 py-0.5 rounded font-black";
  else badge.className = "badge-thaico text-xs px-2.5 py-0.5 rounded font-black";

  document.getElementById("wild-monster-realm").innerText = monster.realmName;
  document.getElementById("wild-monster-elem").innerText = monster.element;
  document.getElementById("wild-monster-hp").innerText = monster.hp.toLocaleString();
  document.getElementById("wild-monster-atk").innerText = monster.atk.toLocaleString();
  document.getElementById("wild-monster-def").innerText = monster.def.toLocaleString();
  document.getElementById("wild-reward-preview").innerText = `+${monster.exp.toLocaleString()} Tu Vi, +${monster.stones.toLocaleString()} Linh Thạch + Tỉ lệ rơi Yêu Đan, Công Pháp & Huyết Thú`;
}

// ================= 6. NÔNG TRẠI ĐỘNG PHỦ =================
function renderGardenPlots() {
  if (!currentChar || !currentChar.gardens) return;

  const grid = document.getElementById("garden-plots-grid");
  const plots = currentChar.gardens[selectedGarden] || [];

  const stageIcons = ["🌱 Hạt giống", "🌿 Nảy mầm", "☘️ Ra lá", "🌸 Đơm hoa", "🌾 Chín muồi"];
  const stageColors = ["text-[#6B6B6B]", "text-[#2A6E3B]", "text-[#1C5F6F]", "text-[#6E2E8C]", "text-[#B3261E] font-bold"];

  grid.innerHTML = plots.map(p => {
    const isRipe = p.stage >= 4;
    return `
      <div class="plot-card ${isRipe ? 'ripe' : ''}">
        <div class="text-3xl mb-1">${isRipe ? '✨' : (p.stage > 1 ? '🌿' : '🌱')}</div>
        <div class="text-xs ${stageColors[p.stage]} mb-2">
          ${stageIcons[p.stage] || 'Trống'}
        </div>
        <div class="w-full text-[10px] space-y-0.5 text-[#6B6B6B] border-t border-[rgba(26,26,26,0.12)] pt-1.5 font-serif-num">
          <div class="flex justify-between">
            <span>Ẩm:</span>
            <span class="text-[#1A1A1A] font-bold">${p.water}/5</span>
          </div>
          <div class="flex justify-between">
            <span>Phân:</span>
            <span class="text-[#1A1A1A] font-bold">${p.fert}/6</span>
          </div>
          <div class="flex justify-between">
            <span>Sâu:</span>
            <span>${p.hasBug ? '<span class="text-[#B3261E] font-bold">🐛 Có sâu</span>' : '<span class="text-[#2A6E3B]">Sạch</span>'}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function checkWellCooldown() {
  if (!currentChar) return;
  const btn = document.getElementById("btn-gather-well");
  const text = document.getElementById("well-btn-text");

  if (wellInterval) clearInterval(wellInterval);

  wellInterval = setInterval(() => {
    const now = Date.now();
    if (currentChar.wellCooldownUntil && currentChar.wellCooldownUntil > now) {
      const leftSec = Math.ceil((currentChar.wellCooldownUntil - now) / 1000);
      btn.disabled = true;
      text.innerText = `Linh Tuyền Đang Tụ (${leftSec}s)`;
    } else {
      btn.disabled = false;
      text.innerText = "Múc Nước Giếng";
    }
  }, 1000);
}

// ================= 7. TÚI CÀN KHÔN & CÔNG PHÁP, HUYẾT THÚ =================
function renderInventory() {
  if (!currentChar || !currentChar.inventory) return;

  const grid = document.getElementById("inventory-grid");
  const countBadge = document.getElementById("inv-count-badge");
  const tabBadge = document.getElementById("tab-inv-badge");
  const inv = currentChar.inventory;

  const keys = Object.keys(inv).filter(k => inv[k] > 0);
  if (countBadge) countBadge.innerText = `${keys.length} Loại Vật Phẩm`;
  if (tabBadge) tabBadge.innerText = `${keys.length}`;

  if (keys.length === 0) {
    grid.innerHTML = `<div class="col-span-2 sm:col-span-3 md:col-span-4 text-center text-[#8C8C8C] py-8 italic text-xs">Túi Càn Khôn trống không. Hãy vào Bãi Săn diệt quái hoặc chăm sóc Động Phủ!</div>`;
    return;
  }

  grid.innerHTML = keys.map(k => {
    const meta = ITEM_META[k] || { name: k, icon: "📦", desc: "Vật phẩm tu tiên bí ẩn." };
    const count = inv[k];

    let actionButton = "";
    if (meta.usable) {
      actionButton = `
        <button class="btn-use-item btn-seal mt-2 w-full py-1.5 text-xs font-bold" data-key="${k}">
          <i class="fa-solid fa-sparkles mr-1"></i> Sử Dụng / Luyện Hóa
        </button>
      `;
    } else if (meta.isSkill) {
      actionButton = `
        <button class="btn-learn-skill btn-ink mt-2 w-full py-1.5 text-xs font-bold" data-key="${k}">
          <i class="fa-solid fa-book-open mr-1"></i> Lĩnh Ngộ Bí Kíp
        </button>
      `;
    } else if (meta.isBloodline) {
      actionButton = `
        <button class="btn-refine-blood btn-seal mt-2 w-full py-1.5 text-xs font-bold" data-key="${k}">
          <i class="fa-solid fa-droplet mr-1"></i> Thối Thể Huyết Mạch
        </button>
      `;
    }

    return `
      <div class="inv-cell p-2.5 rounded bg-[#FAF4EB] border border-[rgba(26,26,26,0.18)] flex flex-col justify-between hover:border-[#B3261E] transition">
        <div>
          <div class="flex items-center gap-2.5 mb-1.5">
            <span class="text-2xl">${meta.icon}</span>
            <div class="min-w-0 flex-1">
              <div class="font-bold text-xs text-[#1A1A1A] truncate">${meta.name}</div>
              <div class="text-[11px] text-[#B3261E] font-serif-num font-bold">Số lượng: x${count}</div>
            </div>
          </div>
          <p class="text-[10px] text-[#6B6B6B] leading-relaxed line-clamp-2">${meta.desc}</p>
        </div>
        ${actionButton}
      </div>
    `;
  }).join("");

  // Gán sự kiện
  grid.querySelectorAll(".btn-use-item").forEach(btn => {
    btn.addEventListener("click", () => useItem(btn.getAttribute("data-key")));
  });
  grid.querySelectorAll(".btn-learn-skill").forEach(btn => {
    btn.addEventListener("click", () => learnSkill(btn.getAttribute("data-key")));
  });
  grid.querySelectorAll(".btn-refine-blood").forEach(btn => {
    btn.addEventListener("click", () => refineBloodline(btn.getAttribute("data-key")));
  });
}

function renderSkillsAndBloodlines() {
  if (!currentChar) return;

  const skillsContainer = document.getElementById("skills-list-container");
  const bloodContainer = document.getElementById("bloodlines-list-container");

  // Công pháp đã học
  const learned = currentChar.learnedSkills || [];
  if (learned.length === 0) {
    skillsContainer.innerHTML = `<div class="text-[#8C8C8C] italic text-xs">Chưa lĩnh ngộ bí kíp nào. Hãy đi săn quái ở Bãi Săn Tự Do để nhận rơi bí kíp!</div>`;
  } else {
    skillsContainer.innerHTML = learned.map(skId => {
      const meta = ITEM_META[skId] || { name: skId, icon: "📖", desc: "" };
      return `
        <div class="bg-[#FAF4EB] border border-[rgba(26,26,26,0.18)] rounded p-2.5 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">${meta.icon}</span>
            <div>
              <div class="font-bold text-xs text-[#1A1A1A]">${meta.name}</div>
              <div class="text-[10px] text-[#6B6B6B]">${meta.desc}</div>
            </div>
          </div>
          <span class="seal-stamp text-[10px] py-0.5 px-2">Đã Lĩnh Ngộ</span>
        </div>
      `;
    }).join("");
  }

  // Huyết thú đã luyện hóa
  const absorbed = currentChar.absorbedBloodlines || [];
  if (absorbed.length === 0) {
    bloodContainer.innerHTML = `<div class="text-[#8C8C8C] italic text-xs">Chưa luyện hóa huyết mạch hung thú nào. Săn yêu thú biến dị/thái cổ để thu thập!</div>`;
  } else {
    bloodContainer.innerHTML = absorbed.map(bId => {
      const meta = ITEM_META[bId] || { name: bId, icon: "🩸", desc: "" };
      return `
        <div class="bg-[#FAF4EB] border border-[rgba(26,26,26,0.18)] rounded p-2.5 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">${meta.icon}</span>
            <div>
              <div class="font-bold text-xs text-[#1A1A1A]">${meta.name}</div>
              <div class="text-[10px] text-[#6B6B6B]">${meta.desc}</div>
            </div>
          </div>
          <span class="seal-stamp text-[10px] py-0.5 px-2">Đã Thối Thể</span>
        </div>
      `;
    }).join("");
  }
}

// Lĩnh ngộ công pháp
async function learnSkill(skillId) {
  if (!currentChar) return;
  try {
    const res = await fetch("/api/skills/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name, skillId })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi lĩnh ngộ: " + err.message);
  }
}

// Luyện hóa huyết thú
async function refineBloodline(bloodlineId) {
  if (!currentChar) return;
  try {
    const res = await fetch("/api/bloodline/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name, bloodlineId })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi thối thể: " + err.message);
  }
}

// ================= 8. BOSS THẾ GIỚI REALTIME =================
function updateBossUI(boss) {
  if (!boss) return;

  const nameEl = document.getElementById("boss-name");
  const hpText = document.getElementById("boss-hp-text");
  const hpBar = document.getElementById("boss-hp-bar");
  const statusEl = document.getElementById("boss-status-badge");
  const attackBtn = document.getElementById("btn-attack-boss");
  const dpsTable = document.getElementById("boss-dps-table");

  if (nameEl) nameEl.innerText = boss.name;

  const currentHp = boss.currentHp || 0;
  const maxHp = boss.maxHp || 5000000;
  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  if (hpText) hpText.innerText = `${currentHp.toLocaleString()} / ${maxHp.toLocaleString()} (${pct.toFixed(1)}%)`;
  if (hpBar) hpBar.style.width = `${pct}%`;

  if (boss.isAlive) {
    statusEl.innerHTML = `🔥 Đang Hoành Hành Cửu Châu`;
    statusEl.className = "mt-1 inline-block px-2.5 py-0.5 rounded text-[10px] font-bold seal-stamp";
    if (attackBtn) attackBtn.disabled = false;
  } else {
    statusEl.innerHTML = `💀 Đã Bị Trảm Sát (Hồi sinh trong chốc lát)`;
    statusEl.className = "mt-1 inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FAF4EB] text-[#6B6B6B] border border-[rgba(26,26,26,0.2)]";
    if (attackBtn) attackBtn.disabled = true;
  }

  if (dpsTable && boss.dpsTable) {
    const sorted = Object.entries(boss.dpsTable).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      dpsTable.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-[#8C8C8C] italic">Chưa có đạo hữu nào khai chiến!</td></tr>`;
    } else {
      dpsTable.innerHTML = sorted.slice(0, 10).map(([name, dmg], idx) => {
        let rankBadge = `${idx + 1}`;
        if (idx === 0) rankBadge = "🥇";
        else if (idx === 1) rankBadge = "🥈";
        else if (idx === 2) rankBadge = "🥉";

        return `
          <tr class="hover:bg-[#FAF4EB]/80">
            <td class="p-2 text-center font-bold text-[#B3261E] text-sm">${rankBadge}</td>
            <td class="p-2 text-[#1A1A1A] font-bold">${escapeHtml(name)}</td>
            <td class="p-2 text-right font-bold text-[#B3261E] text-xs font-serif-num">${dmg.toLocaleString()}</td>
          </tr>
        `;
      }).join("");
    }
  }
}

// ================= 9. MODAL ĐÀI ĐỘ KIẾP LÔI ĐÌNH =================
function openTribulationModal() {
  if (!currentChar || !currentStats) return;

  const modal = document.getElementById("tribulation-modal");
  document.getElementById("trib-current-realm").innerText = currentStats.realmName;
  document.getElementById("trib-next-realm").innerText = "Cảnh Giới Tiếp Theo";

  // Check số lượng Hộ Mạch Đan
  const shieldCount = (currentChar.inventory && currentChar.inventory["dan_ho_mach"]) || 0;
  document.getElementById("trib-shield-pill-count").innerText = shieldCount;
  const chk = document.getElementById("trib-use-shield-pill");
  chk.checked = shieldCount > 0;
  chk.disabled = shieldCount === 0;

  const logsBox = document.getElementById("trib-logs-container");
  logsBox.innerHTML = `<div class="text-[#8C8C8C] italic text-xs">Sẵn sàng dẫn động thiên kiếp! Hãy bấm nút bên dưới.</div>`;
  logsBox.classList.remove("hidden");

  modal.classList.remove("hidden");
}

function closeTribulationModal() {
  document.getElementById("tribulation-modal").classList.add("hidden");
}

async function executeTribulation() {
  if (!currentChar) return;

  const useShield = document.getElementById("trib-use-shield-pill").checked;
  const logsBox = document.getElementById("trib-logs-container");
  const execBtn = document.getElementById("btn-execute-tribulation");

  execBtn.disabled = true;
  logsBox.innerHTML = `<div class="text-amber-400 font-bold animate-pulse">⚡ MÂY ĐEN KÉO ĐẾN! THIÊN KIẾP LÔI ĐÌNH ĐANG HẠN XUỐNG...</div>`;

  try {
    const res = await fetch("/api/tribulation/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name, useShieldPill: useShield })
    });
    const data = await res.json();

    if (data.tribulation && data.tribulation.strikes) {
      let strikesHtml = data.tribulation.strikes.map(st => `
        <div class="my-1 p-2 rounded bg-[#FAF4EB] border ${st.remainingHp > 0 ? 'border-[rgba(26,26,26,0.2)] text-[#1A1A1A]' : 'border-[#B3261E] text-[#B3261E]'}">
          ⚡ <strong>${st.text}</strong>
        </div>
      `).join("");

      const resultBanner = data.success ? `
        <div class="mt-2 p-2.5 rounded bg-[#FAF4EB] border-2 border-[#2A6E3B] text-[#2A6E3B] font-bold text-center text-xs">
          🎉 ${data.message}
        </div>
      ` : `
        <div class="mt-2 p-2.5 rounded bg-[#FAF4EB] border-2 border-[#B3261E] text-[#B3261E] font-bold text-center text-xs">
          💀 ${data.message}
        </div>
      `;

      logsBox.innerHTML = strikesHtml + resultBanner;
    } else {
      logsBox.innerHTML = `<div class="text-red-400 font-bold">${data.error || data.message}</div>`;
    }

    if (data.character) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();
    }
  } catch (err) {
    logsBox.innerHTML = `<div class="text-red-400">Lỗi độ kiếp: ${err.message}</div>`;
  } finally {
    execBtn.disabled = false;
  }
}

// ================= 10. THIẾT LẬP CÁC SỰ KIỆN TƯƠNG TÁC =================
function setupEventHandlers() {
  // 1. Mở Modal Độ Kiếp
  const btnTopTrib = document.getElementById("btn-top-tribulation");
  if (btnTopTrib) btnTopTrib.addEventListener("click", openTribulationModal);
  const btnModalTrib = document.getElementById("btn-open-tribulation-modal");
  if (btnModalTrib) btnModalTrib.addEventListener("click", openTribulationModal);
  const btnCancelTrib = document.getElementById("btn-cancel-tribulation");
  if (btnCancelTrib) btnCancelTrib.addEventListener("click", closeTribulationModal);
  const btnExecTrib = document.getElementById("btn-execute-tribulation");
  if (btnExecTrib) btnExecTrib.addEventListener("click", executeTribulation);

  // Quản lý Chat Bot Widget Popup (Nút tròn góc phải)
  const btnToggleChat = document.getElementById("btn-toggle-chat");
  const chatDrawer = document.getElementById("chat-drawer");
  const btnCloseChat = document.getElementById("btn-close-chat");
  const chatBadge = document.getElementById("chat-unread-badge");

  if (btnToggleChat && chatDrawer) {
    btnToggleChat.addEventListener("click", () => {
      const isHidden = chatDrawer.classList.contains("opacity-0");
      if (isHidden) {
        chatDrawer.classList.remove("opacity-0", "pointer-events-none", "scale-95");
        if (chatBadge) {
          chatBadge.classList.add("hidden");
          chatBadge.innerText = "0";
        }
        const input = document.getElementById("chat-input");
        if (input) input.focus();
        scrollChatToBottom();
      } else {
        chatDrawer.classList.add("opacity-0", "pointer-events-none", "scale-95");
      }
    });
  }

  if (btnCloseChat && chatDrawer) {
    btnCloseChat.addEventListener("click", () => {
      chatDrawer.classList.add("opacity-0", "pointer-events-none", "scale-95");
    });
  }

  // Quản lý Hamburger Menu Drawer (Ngọc Bản Tu Sĩ)
  const btnToggleMenu = document.getElementById("btn-toggle-menu");
  const btnCloseMenu = document.getElementById("btn-close-menu");
  const menuBackdrop = document.getElementById("menu-backdrop");
  const hamburgerDrawer = document.getElementById("hamburger-drawer");

  const openDrawer = () => {
    if (hamburgerDrawer && menuBackdrop) {
      menuBackdrop.classList.remove("opacity-0", "pointer-events-none");
      hamburgerDrawer.classList.remove("translate-x-full");
    }
  };

  const closeDrawer = () => {
    if (hamburgerDrawer && menuBackdrop) {
      menuBackdrop.classList.add("opacity-0", "pointer-events-none");
      hamburgerDrawer.classList.add("translate-x-full");
    }
  };

  if (btnToggleMenu) btnToggleMenu.addEventListener("click", openDrawer);
  if (btnCloseMenu) btnCloseMenu.addEventListener("click", closeDrawer);
  if (menuBackdrop) menuBackdrop.addEventListener("click", closeDrawer);

  // Phím tắt chuyển tab trong Hamburger Drawer
  document.querySelectorAll(".drawer-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      const navBtn = document.querySelector(`.nav-tab[data-tab="${targetTab}"]`);
      if (navBtn) navBtn.click();
      closeDrawer();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburgerDrawer && !hamburgerDrawer.classList.contains("translate-x-full")) {
      closeDrawer();
    }
  });

  // Bế quan tẩy uế kinh mạch (Top Bar, Left Sidebar, Tab Tọa Thiền)
  const btnTopCleanse = document.getElementById("btn-top-cleanse");
  if (btnTopCleanse) btnTopCleanse.addEventListener("click", handleFoundationCleanse);

  const btnSideCleanse = document.getElementById("btn-side-cleanse");
  if (btnSideCleanse) btnSideCleanse.addEventListener("click", handleFoundationCleanse);

  const btnCultCleanse = document.getElementById("btn-cult-cleanse");
  if (btnCultCleanse) btnCultCleanse.addEventListener("click", handleFoundationCleanse);

  // 2. Trích xuất Tụ Linh Đỉnh
  document.getElementById("btn-claim-reservoir").addEventListener("click", async () => {
    if (!currentChar) return;
    try {
      const res = await fetch("/api/reservoir/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentChar.name })
      });
      const data = await res.json();
      if (data.success) {
        currentChar = data.character;
        currentStats = data.stats;
        updateUI();
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Lỗi trích xuất: " + err.message);
    }
  });

  // 3. Tẩy Tủy Thể Chất
  document.getElementById("btn-roll-physique").addEventListener("click", async () => {
    if (!currentChar) return;
    try {
      const res = await fetch("/api/physique/wash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentChar.name })
      });
      const data = await res.json();
      if (data.success) {
        currentChar = data.character;
        updateUI();
      } else {
        alert(data.error || "Không thể tẩy tủy!");
      }
    } catch (err) {
      alert("Lỗi tẩy tủy: " + err.message);
    }
  });

  document.getElementById("btn-physique-accept").addEventListener("click", () => confirmPhysique("ACCEPT"));
  document.getElementById("btn-physique-reject").addEventListener("click", () => confirmPhysique("REJECT"));

  // 4. Quick Pills trên màn hình Tọa Thiền
  document.querySelectorAll(".btn-quick-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemKey = btn.getAttribute("data-item");
      useItem(itemKey);
    });
  });

  // 5. Chuyển Chế Độ Bãi Săn (Cảnh Giới vs Tự Do)
  const btnSafe = document.getElementById("btn-switch-safe-zone");
  const btnWild = document.getElementById("btn-switch-wild-zone");
  const panelSafe = document.getElementById("hunting-safe-panel");
  const panelWild = document.getElementById("hunting-wild-panel");

  btnSafe.addEventListener("click", () => {
    btnSafe.className = "flex-1 py-1.5 px-3 rounded text-xs font-bold btn-seal flex items-center justify-center gap-1.5";
    btnWild.className = "flex-1 py-1.5 px-3 rounded text-xs font-bold btn-ink flex items-center justify-center gap-1.5";
    panelSafe.classList.remove("hidden");
    panelWild.classList.add("hidden");
  });

  btnWild.addEventListener("click", () => {
    btnWild.className = "flex-1 py-1.5 px-3 rounded text-xs font-bold btn-seal flex items-center justify-center gap-1.5";
    btnSafe.className = "flex-1 py-1.5 px-3 rounded text-xs font-bold btn-ink flex items-center justify-center gap-1.5";
    panelWild.classList.remove("hidden");
    panelSafe.classList.add("hidden");
  });

  // Đổi Zone an toàn
  document.getElementById("select-hunting-zone").addEventListener("change", (e) => {
    selectedZoneIndex = parseInt(e.target.value) || 0;
    updateSafeMonsterDisplay();
  });

  // Đánh Bãi Săn Cảnh Giới
  document.getElementById("btn-hunt-safe-x1").addEventListener("click", () => doHuntSafe("X1"));
  document.getElementById("btn-hunt-safe-x10").addEventListener("click", () => doHuntSafe("X10"));

  // Bãi Săn Tự Do: Dò Tìm & Đánh
  document.getElementById("btn-scout-wild").addEventListener("click", scoutWildMonster);
  document.getElementById("btn-fight-wild").addEventListener("click", fightWildMonster);

  document.getElementById("btn-clear-logs").addEventListener("click", () => {
    document.getElementById("combat-logs-box").innerHTML = `<div class="text-[#8C8C8C] italic text-xs">Đã xóa nhật ký giao chiến.</div>`;
  });

  // 6. Hồi máu nhanh
  document.getElementById("btn-quick-heal").addEventListener("click", async () => {
    if (!currentChar) return;
    try {
      const res = await fetch("/api/character/heal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentChar.name })
      });
      const data = await res.json();
      if (data.success) {
        currentChar.currentHp = data.currentHp;
        updateUI();
        alert(data.message);
      }
    } catch (err) {
      alert("Lỗi hồi máu: " + err.message);
    }
  });

  document.getElementById("btn-quick-stamina").addEventListener("click", () => useItem("dan_the_luc"));

  // 7. Giếng nước
  document.getElementById("btn-gather-well").addEventListener("click", async () => {
    if (!currentChar) return;
    try {
      const res = await fetch("/api/farm/well", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentChar.name })
      });
      const data = await res.json();
      if (data.success) {
        currentChar.wellCooldownUntil = data.cooldownUntil;
        currentChar.inventory = data.inventory;
        updateUI();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Lỗi múc nước: " + err.message);
    }
  });

  // 8. Chuyển vườn nông trại
  document.querySelectorAll(".farm-garden-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".farm-garden-btn").forEach(b => {
        b.classList.remove("active", "btn-seal");
        b.classList.add("btn-ink");
      });
      btn.classList.remove("btn-ink");
      btn.classList.add("active", "btn-seal");

      selectedGarden = btn.getAttribute("data-garden");
      renderGardenPlots();
    });
  });

  // 9. Thao tác AOE nông trại
  document.querySelectorAll(".farm-aoe-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.getAttribute("data-action");
      if (!currentChar) return;

      try {
        const res = await fetch("/api/farm/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: currentChar.name, gardenType: selectedGarden, action })
        });
        const data = await res.json();
        if (data.success) {
          currentChar.gardens = data.gardens;
          currentChar.inventory = data.inventory;
          updateUI();
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert("Lỗi nông trại: " + err.message);
      }
    });
  });

  // 10. Luyện Đan
  document.querySelectorAll(".btn-craft-pill").forEach(btn => {
    btn.addEventListener("click", async () => {
      const pillType = btn.getAttribute("data-pill");
      if (!currentChar) return;

      try {
        const res = await fetch("/api/alchemy/craft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: currentChar.name, pillType })
        });
        const data = await res.json();
        if (data.success) {
          currentChar.inventory = data.inventory;
          updateUI();
          alert(data.message);
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert("Lỗi luyện đan: " + err.message);
      }
    });
  });

  // 11. Boss thế giới
  document.getElementById("btn-attack-boss").addEventListener("click", () => {
    if (!currentChar || !socket) return;
    socket.emit("boss:attack", { charName: currentChar.name });
  });

  // 12. Chat thế giới
  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text || !currentChar || !socket) return;

    socket.emit("chat:send", {
      sender: currentChar.name,
      realm: currentStats ? currentStats.realmName : "Tu Sĩ",
      text
    });

    input.value = "";
  });
}

// Bãi săn an toàn theo cảnh giới
async function doHuntSafe(mode) {
  if (!currentChar) return;
  const zone = huntingZones[selectedZoneIndex];
  if (!zone) return;

  try {
    const res = await fetch("/api/training/hunt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name, zoneId: zone.id, monsterIndex: 0, mode })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();

      let dropSummary = "";
      if (data.droppedItems && data.droppedItems.length > 0) {
        dropSummary = `<div class="mt-1 text-[#B3261E] font-bold text-xs">🎁 Cơ Duyên Thu Được: ` +
          data.droppedItems.map(d => `<span class="bg-[#FAF4EB] px-1.5 py-0.5 rounded border border-[#B3261E]/40 text-[#B3261E] mr-1">${d.name} x${d.count}</span>`).join("") +
          `</div>`;
      }

      const box = document.getElementById("combat-logs-box");
      const outcomeHtml = `
        <div class="my-1.5 p-2 rounded bg-[#FAF4EB] border ${data.winCount > 0 ? 'border-[rgba(26,26,26,0.25)] text-[#1A1A1A]' : 'border-[#B3261E]/50 text-[#B3261E]'}">
          <div class="font-bold text-xs">⚔️ Lịch Luyện [${data.zoneName} - ${data.runs} Hiệp]: Thắng ${data.winCount}/${data.runs} trận trước [${data.monsterName}]</div>
          <div class="text-[11px] text-[#6B6B6B] mt-0.5">
            Nhận: +${data.totalExp.toLocaleString()} Tu Vi, +${data.totalStones.toLocaleString()} Linh Thạch.
          </div>
          ${dropSummary}
        </div>
      `;

      const detailLogs = (data.logs || []).map(l => `<div class="text-[#6B6B6B] text-[11px] pl-1 border-l-2 border-[rgba(26,26,26,0.15)]">${escapeHtml(l)}</div>`).join("");
      box.innerHTML = outcomeHtml + detailLogs + box.innerHTML;
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi lịch luyện: " + err.message);
  }
}

// Bãi săn tự do: Dò tìm yêu thú
async function scoutWildMonster() {
  if (!currentChar) return;
  try {
    const res = await fetch("/api/training/wild-scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name })
    });
    const data = await res.json();
    if (data.success) {
      currentChar.currentWildMonster = data.monster;
      renderWildScoutedMonster();
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi dò tìm: " + err.message);
  }
}

// Bãi săn tự do: Khởi chiến
async function fightWildMonster() {
  if (!currentChar) return;
  try {
    const res = await fetch("/api/training/wild-fight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();

      let dropSummary = "";
      if (data.droppedItems && data.droppedItems.length > 0) {
        dropSummary = `<div class="mt-1 text-[#B3261E] font-bold text-xs">✨ BẢO VẬT HOANG DÃ: ` +
          data.droppedItems.map(d => `<span class="bg-[#FAF4EB] px-1.5 py-0.5 rounded border border-[#B3261E]/50 text-[#B3261E] mr-1">${d.name} x${d.count}</span>`).join("") +
          `</div>`;
      }

      const box = document.getElementById("combat-logs-box");
      const outcomeHtml = `
        <div class="my-1.5 p-2 rounded bg-[#FAF4EB] border ${data.isWin ? 'border-[rgba(26,26,26,0.25)] text-[#1A1A1A]' : 'border-[#B3261E]/50 text-[#B3261E]'}">
          <div class="font-bold text-xs">🔥 ${data.isWin ? 'ĐẠI THẮNG' : 'THẤT BẠI'}: Giao chiến sinh tử với [${data.monsterName}]</div>
          ${data.isWin ? `
            <div class="text-[11px] text-[#6B6B6B] mt-0.5">
              Thu hoạch: +${data.totalExp.toLocaleString()} Tu Vi, +${data.totalStones.toLocaleString()} Linh Thạch!
            </div>
            ${dropSummary}
          ` : `
            <div class="text-[11px] text-[#B3261E] mt-0.5">${data.message}</div>
          `}
        </div>
      `;

      const detailLogs = (data.logs || []).map(l => `<div class="text-[#6B6B6B] text-[11px] pl-1 border-l-2 border-[rgba(26,26,26,0.15)]">${escapeHtml(l)}</div>`).join("");
      box.innerHTML = outcomeHtml + detailLogs + box.innerHTML;
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi khởi chiến: " + err.message);
  }
}

// Xác nhận thể chất Tẩy Tủy
async function confirmPhysique(action) {
  if (!currentChar) return;
  try {
    const res = await fetch("/api/physique/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name, action })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi xác nhận thể chất: " + err.message);
  }
}

// Sử dụng vật phẩm / cắn đan
async function useItem(itemKey) {
  if (!currentChar) return;
  try {
    const res = await fetch("/api/item/use", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name, itemKey })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi dùng vật phẩm: " + err.message);
  }
}

// Chuyển Tabs trên giao diện
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.remove("active");
        pane.classList.add("hidden");
      });

      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
        targetPane.classList.remove("hidden");
      }

      if (targetId === "tab-cultivation" && dongPhuEngine) {
        setTimeout(() => dongPhuEngine.resize(), 50);
      }
    });
  });
}

function appendChatMessage(msg) {
  const container = document.getElementById("chat-messages-container");
  const div = document.createElement("div");
  div.className = "bg-[#FAF4EB] rounded p-2 border border-[rgba(26,26,26,0.15)]";

  const isMe = currentChar && currentChar.name === msg.sender;

  div.innerHTML = `
    <div class="flex items-center justify-between text-xs mb-0.5">
      <div class="flex items-center gap-1.5">
        <span class="font-bold ${isMe ? 'text-[#B3261E]' : 'text-[#1A1A1A]'}">${escapeHtml(msg.sender)}</span>
        <span class="text-[9px] px-1 py-0.2 rounded border border-[rgba(26,26,26,0.18)] bg-[#F0E5D0] text-[#6B6B6B]">${escapeHtml(msg.realm)}</span>
      </div>
      <span class="text-[10px] text-[#8C8C8C] font-serif-num">${msg.time}</span>
    </div>
    <div class="text-xs text-[#2A2A2A] break-words leading-relaxed">${escapeHtml(msg.text)}</div>
  `;

  container.appendChild(div);
}

function appendSystemNotice(text) {
  const container = document.getElementById("chat-messages-container");
  const div = document.createElement("div");
  div.className = "chat-sys text-xs sm:text-sm my-1.5 font-bold";
  div.innerHTML = escapeHtml(text);
  container.appendChild(div);
}

function scrollChatToBottom() {
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function notifyNewChatMessage() {
  const chatDrawer = document.getElementById("chat-drawer");
  const badge = document.getElementById("chat-unread-badge");
  if (chatDrawer && badge && chatDrawer.classList.contains("opacity-0")) {
    badge.classList.remove("hidden");
    const count = parseInt(badge.innerText) || 0;
    badge.innerText = Math.min(99, count + 1);
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showBossFloatingDamage(dmg) {
  const btn = document.getElementById("btn-attack-boss");
  if (!btn || !btn.parentElement) return;

  const el = document.createElement("div");
  el.className = "floating-damage text-yellow-300 text-lg font-black";
  el.innerText = `-${dmg.toLocaleString()} 💥`;
  el.style.left = `${btn.offsetLeft + (btn.offsetWidth / 2) - 40 + (Math.random() * 40 - 20)}px`;
  el.style.top = `${btn.offsetTop - 15}px`;

  btn.parentElement.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}
