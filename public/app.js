// public/app.js - Logic điều khiển Frontend Tu Chân Giới
let currentChar = null;
let currentStats = null;
let selectedGarden = "DAN";
let socket = null;
let wellInterval = null;

// Element icons
const ELEMENT_ICONS = {
  "Kim": "⚔️",
  "Mộc": "🌿",
  "Thủy": "💧",
  "Hỏa": "🔥",
  "Thổ": "🏔️"
};

// Item labels & descriptions
const ITEM_META = {
  "thao_duoc_linh_chi": { name: "Thảo Dược Linh Chi", icon: "🍄", desc: "Dược liệu cơ bản để luyện chế Thể Lực Đan." },
  "thao_duoc_hoang_tinh": { name: "Hoàng Tinh Thảo", icon: "🌾", desc: "Dược liệu bổ sung nguyên khí." },
  "thao_duoc_quy_hiem": { name: "Thất Tinh Thảo Quý", icon: "✨", desc: "Linh thảo ngàn năm cực kỳ hiếm có." },
  "nuoc_linh_khi": { name: "Nước Linh Khí", icon: "🧪", desc: "Múc từ Giếng Linh Tuyền, dùng tưới tắm linh điền." },
  "dan_the_luc": { name: "Thể Lực Đan", icon: "💊", desc: "Hồi phục ngay +50 Thể Lực.", usable: true },
  "dan_hoi_mau": { name: "Hồi Huyết Đan", icon: "❤️", desc: "Hồi phục toàn bộ sinh mệnh khi bị thương.", usable: true }
};

// Quái thú lịch luyện theo cảnh giới
const CLIENT_MONSTERS = [
  { realmMin: 1, name: "Hỏa Sí Ma Lang", element: "Hỏa", hp: 300, atk: 35, def: 15, exp: 50, stones: 30, icon: "🐺" },
  { realmMin: 3, name: "Thanh Mãng Xà Tinh", element: "Mộc", hp: 650, atk: 70, def: 35, exp: 120, stones: 70, icon: "🐍" },
  { realmMin: 6, name: "Hắc Thủy Cự Hạt", element: "Thủy", hp: 1300, atk: 140, def: 70, exp: 250, stones: 150, icon: "🦂" },
  { realmMin: 10, name: "Thiết Bối Hùng Vương", element: "Thổ", hp: 3500, atk: 400, def: 250, exp: 700, stones: 400, icon: "🐻" },
  { realmMin: 14, name: "Kim Sí Điêu Vương", element: "Kim", hp: 15000, atk: 1800, def: 1000, exp: 2000, stones: 1200, icon: "🦅" },
  { realmMin: 18, name: "Xích Diễm Ma Giao", element: "Hỏa", hp: 60000, atk: 7500, def: 4000, exp: 6000, stones: 4000, icon: "🐲" },
  { realmMin: 22, name: "U Minh Bạch Hổ", element: "Kim", hp: 220000, atk: 30000, def: 16000, exp: 18000, stones: 12000, icon: "🐯" },
  { realmMin: 26, name: "Thái Cổ Cự Kình", element: "Thủy", hp: 800000, atk: 110000, def: 55000, exp: 50000, stones: 35000, icon: "🐋" }
];

const COUNTER_MAP = {
  "Kim": "Mộc",
  "Mộc": "Thổ",
  "Thổ": "Thủy",
  "Thủy": "Hỏa",
  "Hỏa": "Kim"
};

// ================= 1. KHỞI CHẠY & AUTHENTICATION =================
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initSocket();

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

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("tutien_character_name", data.character.name);
        currentChar = data.character;
        currentStats = data.stats;
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

  // Gán sự kiện cho các nút hành động chính
  setupEventHandlers();
});

// Hiển thị / Ẩn Modal Đăng Nhập
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

  // Cập nhật danh sách đạo hữu online
  socket.on("world:online_users", (users) => {
    const countEl = document.getElementById("online-count");
    const badgeEl = document.getElementById("online-badge");
    const listEl = document.getElementById("online-players-list");

    const countText = `${users.length} Đạo Hữu`;
    if (countEl) countEl.innerText = countText;
    if (badgeEl) badgeEl.innerText = `${users.length} online`;

    if (listEl) {
      listEl.innerHTML = users.map(u => `
        <div class="flex items-center justify-between py-0.5 text-slate-300">
          <span class="flex items-center gap-1.5 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ${escapeHtml(u)}
          </span>
          ${u === (currentChar && currentChar.name) ? '<span class="text-[10px] text-amber-400">(Ta)</span>' : ''}
        </div>
      `).join("");
    }
  });

  // Vòng lặp Thiên Đạo: Cập nhật tu vi và thể lực mỗi 1 giây
  socket.on("character:tick", (tickData) => {
    if (!currentChar) return;
    currentChar.exp = tickData.exp;
    currentChar.stamina = tickData.stamina;
    currentChar.currentHp = tickData.currentHp;
    if (tickData.gardens) currentChar.gardens = tickData.gardens;

    updateTopExpBar();
    updateCultivationTab();
    if (selectedGarden && currentChar.gardens) {
      renderGardenPlots();
    }
  });

  // Lịch sử chat ban đầu
  socket.on("chat:history", (messages) => {
    const container = document.getElementById("chat-messages-container");
    container.innerHTML = "";
    messages.forEach(msg => appendChatMessage(msg));
    scrollChatToBottom();
  });

  // Nhận tin nhắn chat mới
  socket.on("chat:new_message", (msg) => {
    appendChatMessage(msg);
    scrollChatToBottom();
  });

  // Thông báo Thiên Đạo / Hệ Thống
  socket.on("chat:system", (data) => {
    appendSystemNotice(data.text);
    scrollChatToBottom();
  });

  // Đồng bộ Boss Thế Giới
  socket.on("boss:sync", (boss) => {
    updateBossUI(boss);
  });

  // Boss bị tấn công
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

  // Boss bị tiêu diệt
  socket.on("boss:defeated", (data) => {
    updateBossUI(data.boss);
  });

  // Boss hồi sinh
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

  // 3. Tab Tu Luyện & Thể Chất
  updateCultivationTab();

  // 4. Tab Nông Trại & Giếng Nước
  renderGardenPlots();
  checkWellCooldown();

  // 5. Tab Túi Càn Khôn
  renderInventory();

  // 6. Tab Lịch Luyện Quái Thú
  updateTrainingMonster();
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

  // Kiểm tra sẵn sàng đột phá
  const canBreak = currentExp >= maxExp;
  const btnHeader = document.getElementById("btn-breakthrough");
  const btnTab = document.getElementById("btn-cult-breakthrough");

  [btnHeader, btnTab].forEach(btn => {
    if (btn) {
      btn.disabled = !canBreak;
      if (canBreak) {
        btn.classList.add("animate-bounce", "shadow-amber-500/50");
      } else {
        btn.classList.remove("animate-bounce", "shadow-amber-500/50");
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

  if (expBar) expBar.style.width = `${cultPct}%`;
  if (expPctTxt) expPctTxt.innerText = `${cultPct}%`;
  if (expDetail) expDetail.innerText = `${currentChar.exp.toLocaleString()} / ${currentStats.maxExp.toLocaleString()}`;
  if (rateDetail) rateDetail.innerText = `+${currentStats.expPerSec} Tu Vi / Giây`;

  // Thể chất
  const physName = document.getElementById("physique-current-name");
  if (physName) physName.innerText = currentChar.physique;

  // Thể chất đang chờ xác nhận (Pending)
  const pendingBox = document.getElementById("physique-pending-box");
  if (currentChar.physiquePending) {
    pendingBox.classList.remove("hidden");
    document.getElementById("physique-pending-name").innerText = currentChar.physiquePending;
  } else {
    pendingBox.classList.add("hidden");
  }
}

// ================= 5. NÔNG TRẠI ĐỘNG PHỦ =================
function renderGardenPlots() {
  if (!currentChar || !currentChar.gardens) return;

  const grid = document.getElementById("garden-plots-grid");
  const plots = currentChar.gardens[selectedGarden] || [];

  const stageIcons = ["🌱 Hạt giống", "🌿 Nảy mầm", "☘️ Ra lá", "🌸 Đơm hoa", "🌾 Chín muồi"];
  const stageColors = ["text-slate-400", "text-emerald-400", "text-teal-400", "text-purple-400", "text-amber-400 font-bold"];

  grid.innerHTML = plots.map(p => {
    const isRipe = p.stage >= 4;
    return `
      <div class="plot-card ${isRipe ? 'ripe' : ''}">
        <div class="text-2xl mb-1">${isRipe ? '✨' : (p.stage > 1 ? '🌿' : '🌱')}</div>
        <div class="text-xs ${stageColors[p.stage]} mb-2">
          ${stageIcons[p.stage] || 'Trống'}
        </div>
        <div class="w-full text-[10px] space-y-1 text-slate-400 border-t border-slate-800/80 pt-1.5">
          <div class="flex justify-between">
            <span>Ẩm:</span>
            <span class="text-cyan-300 font-mono">${p.water}/5</span>
          </div>
          <div class="flex justify-between">
            <span>Phân:</span>
            <span class="text-amber-300 font-mono">${p.fert}/6</span>
          </div>
          <div class="flex justify-between">
            <span>Sâu bọ:</span>
            <span>${p.hasBug ? '<span class="text-red-400 font-bold">🐛 Có sâu</span>' : '<span class="text-emerald-400">Sạch</span>'}</span>
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

// ================= 6. TÚI ĐỒ CÀN KHÔN (INVENTORY) =================
function renderInventory() {
  if (!currentChar || !currentChar.inventory) return;

  const grid = document.getElementById("inventory-grid");
  const countBadge = document.getElementById("inv-count-badge");
  const inv = currentChar.inventory;

  const keys = Object.keys(inv).filter(k => inv[k] > 0);
  countBadge.innerText = `${keys.length} Vật Phẩm`;

  if (keys.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center text-slate-500 py-8 italic">Túi Càn Khôn trống không. Hãy chăm chỉ lịch luyện và làm nông!</div>`;
    return;
  }

  grid.innerHTML = keys.map(k => {
    const meta = ITEM_META[k] || { name: k, icon: "📦", desc: "Vật phẩm tu tiên." };
    const count = inv[k];

    return `
      <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/40 transition">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-2xl">${meta.icon}</span>
            <div>
              <div class="font-bold text-xs text-slate-200">${meta.name}</div>
              <div class="text-[10px] text-amber-400 font-mono">Số lượng: x${count}</div>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 leading-snug">${meta.desc}</p>
        </div>
        ${meta.usable ? `
          <button class="btn-use-item mt-3 w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold transition" data-key="${k}">
            Sử Dụng
          </button>
        ` : ''}
      </div>
    `;
  }).join("");

  // Bắt sự kiện dùng vật phẩm
  grid.querySelectorAll(".btn-use-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemKey = btn.getAttribute("data-key");
      useItem(itemKey);
    });
  });
}

// ================= 7. BOSS THẾ GIỚI REALTIME =================
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
    statusEl.className = "mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40";
    if (attackBtn) attackBtn.disabled = false;
  } else {
    statusEl.innerHTML = `💀 Đã Bị Trảm Sát (Hồi sinh trong chốc lát)`;
    statusEl.className = "mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700";
    if (attackBtn) attackBtn.disabled = true;
  }

  // Cập nhật bảng xếp hạng DPS
  if (dpsTable && boss.dpsTable) {
    const sorted = Object.entries(boss.dpsTable).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      dpsTable.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-slate-500 italic">Chưa có đạo hữu nào khai chiến!</td></tr>`;
    } else {
      dpsTable.innerHTML = sorted.slice(0, 10).map(([name, dmg], idx) => {
        let rankBadge = `${idx + 1}`;
        if (idx === 0) rankBadge = "🥇";
        else if (idx === 1) rankBadge = "🥈";
        else if (idx === 2) rankBadge = "🥉";

        return `
          <tr class="hover:bg-slate-800/40">
            <td class="p-2 text-center font-bold text-amber-300">${rankBadge}</td>
            <td class="p-2 text-slate-200 font-semibold">${escapeHtml(name)}</td>
            <td class="p-2 text-right font-bold text-red-400">${dmg.toLocaleString()}</td>
          </tr>
        `;
      }).join("");
    }
  }
}

// ================= 8. THIẾT LẬP CÁC SỰ KIỆN TƯƠNG TÁC =================
function setupEventHandlers() {
  // 1. Đột phá cảnh giới
  const handleBreakthrough = async () => {
    if (!currentChar) return;
    try {
      const res = await fetch("/api/breakthrough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentChar.name })
      });
      const data = await res.json();
      alert(data.message || (data.success ? "Đột phá thành công!" : "Đột phá thất bại!"));
      if (data.character) {
        currentChar = data.character;
        currentStats = data.stats;
        updateUI();
      }
    } catch (err) {
      alert("Lỗi đột phá: " + err.message);
    }
  };
  document.getElementById("btn-breakthrough").addEventListener("click", handleBreakthrough);
  document.getElementById("btn-cult-breakthrough").addEventListener("click", handleBreakthrough);

  // 2. Tẩy Tủy Thể Chất
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

  // Tiếp nhận hoặc Giữ cũ thể chất
  document.getElementById("btn-physique-accept").addEventListener("click", async () => {
    confirmPhysique("ACCEPT");
  });
  document.getElementById("btn-physique-reject").addEventListener("click", async () => {
    confirmPhysique("REJECT");
  });

  // 3. Lịch Luyện Solo
  document.getElementById("btn-battle-x1").addEventListener("click", () => doSoloTraining("X1"));
  document.getElementById("btn-battle-x10").addEventListener("click", () => doSoloTraining("X10"));
  document.getElementById("btn-clear-logs").addEventListener("click", () => {
    document.getElementById("combat-logs-box").innerHTML = `<div class="text-slate-600 italic">Đã xóa nhật ký giao chiến.</div>`;
  });

  // 4. Hồi Máu Đầy Đủ
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

  // 5. Cắn Thể Lực Đan nhanh
  document.getElementById("btn-quick-stamina").addEventListener("click", () => {
    useItem("dan_the_luc");
  });

  // 6. Múc Nước Giếng
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

  // 7. Chuyển phân khu Vườn Thảo Dược
  document.querySelectorAll(".farm-garden-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".farm-garden-btn").forEach(b => {
        b.classList.remove("active", "bg-emerald-500/20", "text-emerald-300", "border-emerald-500/40");
        b.classList.add("bg-slate-800", "text-slate-400", "border-slate-700");
      });
      btn.classList.add("active", "bg-emerald-500/20", "text-emerald-300", "border-emerald-500/40");
      btn.classList.remove("bg-slate-800", "text-slate-400", "border-slate-700");

      selectedGarden = btn.getAttribute("data-garden");
      renderGardenPlots();
    });
  });

  // 8. Thao Tác Nông Trại AOE
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

  // 9. Luyện Đan Thể Lực
  document.getElementById("btn-craft-stamina-pill").addEventListener("click", async () => {
    if (!currentChar) return;
    try {
      const res = await fetch("/api/alchemy/craft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentChar.name, pillType: "DAN_THE_LUC" })
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

  // 10. Tấn Công Boss Thế Giới
  document.getElementById("btn-attack-boss").addEventListener("click", () => {
    if (!currentChar || !socket) return;
    socket.emit("boss:attack", { charName: currentChar.name });
  });

  // 11. Gửi tin nhắn Chat Kênh Thế Giới
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

// Thực hiện Lịch Luyện Solo
async function doSoloTraining(mode) {
  if (!currentChar) return;
  try {
    const res = await fetch("/api/training/solo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: currentChar.name, mode })
    });
    const data = await res.json();
    if (data.success) {
      currentChar = data.character;
      currentStats = data.stats;
      updateUI();

      // Render nhật ký chiến đấu
      const box = document.getElementById("combat-logs-box");
      const outcomeHtml = `
        <div class="my-2 p-2 rounded bg-slate-900 border ${data.winCount > 0 ? 'border-emerald-500/40 text-emerald-300' : 'border-red-500/40 text-red-300'}">
          <div class="font-bold">⚔️ Kết Quả Lịch Luyện [${data.mode}]: Thắng ${data.winCount}/${data.runs} trận trước [${data.monsterName}]</div>
          <div class="text-[11px] text-slate-300 mt-1">
            Nhận được: +${data.totalExp.toLocaleString()} Tu Vi, +${data.totalStones.toLocaleString()} Linh Thạch${data.totalHerbs > 0 ? `, +${data.totalHerbs}x Linh Chi` : ''}.
          </div>
        </div>
      `;

      const detailLogs = (data.logs || []).map(l => `<div class="text-slate-400 text-[11px]">${escapeHtml(l)}</div>`).join("");
      box.innerHTML = outcomeHtml + detailLogs + box.innerHTML;
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert("Lỗi lịch luyện: " + err.message);
  }
}

// Sử dụng vật phẩm trong túi đồ
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
      tabs.forEach(t => {
        t.classList.remove("active");
        t.classList.add("text-slate-400");
      });
      tab.classList.add("active");
      tab.classList.remove("text-slate-400");

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
    });
  });
}

// Append tin nhắn chat
function appendChatMessage(msg) {
  const container = document.getElementById("chat-messages-container");
  const div = document.createElement("div");
  div.className = "bg-slate-950/60 rounded-lg p-2 border border-slate-800/80";

  const isMe = currentChar && currentChar.name === msg.sender;

  div.innerHTML = `
    <div class="flex items-center justify-between text-[11px] mb-0.5">
      <div class="flex items-center gap-1.5">
        <span class="font-bold ${isMe ? 'text-amber-400' : 'text-slate-200'}">${escapeHtml(msg.sender)}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">${escapeHtml(msg.realm)}</span>
      </div>
      <span class="text-[10px] text-slate-500">${msg.time}</span>
    </div>
    <div class="text-xs text-slate-300 break-words leading-relaxed">${escapeHtml(msg.text)}</div>
  `;

  container.appendChild(div);
}

function appendSystemNotice(text) {
  const container = document.getElementById("chat-messages-container");
  const div = document.createElement("div");
  div.className = "chat-sys text-xs my-1 font-medium";
  div.innerHTML = escapeHtml(text);
  container.appendChild(div);
}

function scrollChatToBottom() {
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
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

// Cập nhật thông tin Quái thú Lịch Luyện theo cảnh giới nhân vật
function updateTrainingMonster() {
  if (!currentChar) return;
  const valid = CLIENT_MONSTERS.filter(m => m.realmMin <= currentChar.realmId);
  const target = valid[valid.length - 1] || CLIENT_MONSTERS[0];

  const nameEl = document.getElementById("monster-name");
  const hpEl = document.getElementById("monster-hp");
  const atkEl = document.getElementById("monster-atk");
  const defEl = document.getElementById("monster-def");
  const elemBadge = document.getElementById("monster-element-badge");
  const counterTip = document.getElementById("counter-tip");

  if (nameEl) nameEl.innerText = `${target.icon} ${target.name}`;
  if (hpEl) hpEl.innerText = target.hp.toLocaleString();
  if (atkEl) atkEl.innerText = target.atk.toLocaleString();
  if (defEl) defEl.innerText = target.def.toLocaleString();
  if (elemBadge) elemBadge.innerText = `Hệ ${target.element}`;

  if (counterTip) {
    let relationText = "Quy luật Ngũ Hành: Kim → Mộc → Thổ → Thủy → Hỏa → Kim (Khắc chế +25% sát thương)";
    if (COUNTER_MAP[currentChar.element] === target.element) {
      relationText = `⚡ Bản mệnh [${currentChar.element}] khắc chế [${target.element}] của quái thú! Tăng +25% sát thương.`;
    } else if (COUNTER_MAP[target.element] === currentChar.element) {
      relationText = `⚠️ Quái thú hệ [${target.element}] tương khắc với bản mệnh [${currentChar.element}] của bạn! Giảm -15% sát thương.`;
    }
    counterTip.innerHTML = `<i class="fa-solid fa-circle-info text-cyan-400"></i> <span>${relationText}</span>`;
  }
}

// Hiển thị sát thương bay lên khi đánh Boss Thế Giới
function showBossFloatingDamage(dmg) {
  const btn = document.getElementById("btn-attack-boss");
  if (!btn || !btn.parentElement) return;

  const el = document.createElement("div");
  el.className = "floating-damage text-yellow-300 text-base font-black";
  el.innerText = `-${dmg.toLocaleString()} 💥`;
  el.style.left = `${btn.offsetLeft + (btn.offsetWidth / 2) - 40 + (Math.random() * 40 - 20)}px`;
  el.style.top = `${btn.offsetTop - 15}px`;

  btn.parentElement.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

