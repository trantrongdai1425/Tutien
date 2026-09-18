// server/server.js - Máy chủ Express + Socket.io Realtime Tu Chân Giới
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { readDb, saveDb } = require('./db');
const {
  REALMS,
  PHYSIQUES,
  MONSTERS,
  rollPhysique,
  simulateCombat,
  getCalculatedStats,
  createNewCharacter
} = require('./gameEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Cache bộ nhớ để truy xuất cực nhanh
let db = readDb();
let onlineUsers = new Map(); // socketId -> charName

// Lưu dữ liệu định kỳ mỗi 5 giây
setInterval(() => {
  saveDb(db);
}, 5000);

// Vòng lặp Thiên Đạo: Mỗi 1 giây tự động cộng Tu Vi cho người chơi online
setInterval(() => {
  let hasUpdate = false;
  const now = Date.now();

  for (let key in db.characters) {
    let char = db.characters[key];
    let stats = getCalculatedStats(char);

    // Tự động cộng Tu Vi nếu chưa đạt max cảnh giới hiện tại
    if (char.exp < stats.maxExp) {
      char.exp = Math.min(stats.maxExp, char.exp + stats.expPerSec);
      hasUpdate = true;
    }

    // Tự động hồi phục Thể Lực (1 điểm / 60 giây)
    if (!char.lastStaminaRegen) char.lastStaminaRegen = now;
    if (now - char.lastStaminaRegen >= 60000) {
      if (char.stamina < char.maxStamina) {
        char.stamina = Math.min(char.maxStamina, char.stamina + 1);
        hasUpdate = true;
      }
      char.lastStaminaRegen = now;
    }

    // Tự động sinh trưởng thảo dược vườn (mỗi 30s)
    if (!char.lastGardenTick) char.lastGardenTick = now;
    if (now - char.lastGardenTick >= 30000) {
      ['DAN', 'HOA', 'HIEM'].forEach(gType => {
        char.gardens[gType].forEach(plot => {
          if (plot.stage < 4 && Math.random() < 0.25) {
            plot.stage++;
            hasUpdate = true;
          }
        });
      });
      char.lastGardenTick = now;
    }
  }

  // Tự động hồi sinh World Boss nếu đã chết sau 3 phút
  if (!db.worldBoss.isAlive && db.worldBoss.respawnAt && now >= db.worldBoss.respawnAt) {
    db.worldBoss.isAlive = true;
    db.worldBoss.currentHp = db.worldBoss.maxHp;
    db.worldBoss.dpsTable = {};
    db.worldBoss.respawnAt = null;
    io.emit('boss:respawn', { boss: db.worldBoss });
    io.emit('chat:system', { text: `🔥 [THIÊN ĐỊA DỊ BIẾN] ${db.worldBoss.name} đã tái sinh!` });
  }

  if (hasUpdate) {
    // Gửi realtime cập nhật tu vi cho các client đang mở
    onlineUsers.forEach((name, socketId) => {
      const charKey = name.toLowerCase();
      if (db.characters[charKey]) {
        io.to(socketId).emit('character:tick', {
          exp: db.characters[charKey].exp,
          stamina: db.characters[charKey].stamina,
          currentHp: db.characters[charKey].currentHp,
          gardens: db.characters[charKey].gardens
        });
      }
    });
  }
}, 1000);

// ================= REST API ENDPOINTS =================

// 1. Đăng nhập / Tự khởi tạo đạo hiệu nhanh
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Đạo hiệu không được để trống!" });
  }

  const key = name.trim().toLowerCase();
  if (!db.characters[key]) {
    // Chưa có nhân vật -> Tự động khởi tạo mới
    db.characters[key] = createNewCharacter(name, password);
    saveDb(db);
  }

  const char = db.characters[key];
  const stats = getCalculatedStats(char);
  return res.json({ success: true, character: char, stats });
});

// 2. Lấy thông tin nhân vật
app.get('/api/character', (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "Thiếu tên nhân vật" });

  const key = name.trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy đạo hữu này!" });

  const stats = getCalculatedStats(char);
  return res.json({ character: char, stats });
});

// 3. Đột Phá Cảnh Giới
app.post('/api/breakthrough', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const currentStats = getCalculatedStats(char);
  if (char.exp < currentStats.maxExp) {
    return res.status(400).json({ error: "Chưa đủ Tu Vi để tiến hành đột phá!" });
  }

  const currentRealm = REALMS.find(r => r.id === char.realmId);
  const nextRealm = REALMS.find(r => r.id === char.realmId + 1);
  if (!nextRealm) {
    return res.status(400).json({ error: "Đạo hữu đã đạt cảnh giới tối cao!" });
  }

  // Tỷ lệ đột phá thành công
  let baseRate = 0.75 - (char.realmId * 0.015);
  let rate = Math.max(0.25, baseRate);
  let isSuccess = Math.random() < rate;

  if (isSuccess) {
    char.realmId++;
    char.exp = 0;
    const newStats = getCalculatedStats(char);
    char.currentHp = newStats.hp;
    char.maxStamina += 10;
    saveDb(db);

    io.emit('chat:system', {
      text: `🎉 Đạo hữu [${char.name}] độ kiếp thành công, bước vào [${newStats.realmName}]!`
    });

    return res.json({
      success: true,
      message: `Đột phá thành công! Bước vào ${newStats.realmName}`,
      character: char,
      stats: newStats
    });
  } else {
    // Thất bại -> Phản phệ mất 20% tu vi
    char.exp = Math.floor(char.exp * 0.8);
    saveDb(db);
    return res.json({
      success: false,
      message: "Đột phá thất bại! Bị thiên kiếp phản phệ, tổn hao 20% Tu Vi.",
      character: char,
      stats: getCalculatedStats(char)
    });
  }
});

// 4. Tẩy Tủy Thể Chất
app.post('/api/physique/wash', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const COST = 1000;
  if (char.spiritStones < COST) {
    return res.status(400).json({ error: `Không đủ Linh Thạch! Cần ${COST} Linh Thạch.` });
  }

  char.spiritStones -= COST;
  const newPhysique = rollPhysique();
  char.physiquePending = newPhysique.name;
  saveDb(db);

  return res.json({
    success: true,
    message: `Đã tẩy tủy! Xuất hiện: ${newPhysique.name} (${newPhysique.rank} Thể)`,
    newPhysique,
    character: char
  });
});

// 5. Xác nhận Nhận Mới hoặc Giữ Cũ Thể Chất
app.post('/api/physique/confirm', (req, res) => {
  const { name, action } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  if (!char.physiquePending) {
    return res.status(400).json({ error: "Không có thể chất nào đang chờ xác nhận!" });
  }

  const oldPhysique = char.physique;
  const pending = char.physiquePending;

  if (action === "ACCEPT") {
    char.physique = pending;
    char.physiquePending = null;
    saveDb(db);

    const pObj = PHYSIQUES.find(p => p.name === char.physique);
    if (pObj && (pObj.rank === "Thánh" || pObj.rank === "Thần")) {
      io.emit('chat:system', {
        text: `🌟 [THIÊN ĐỊA DỊ TƯỢNG] Đạo hữu [${char.name}] thức tỉnh [${char.physique}]!`
      });
    }

    return res.json({
      success: true,
      message: `Đã tiếp nhận thể chất mới: [${char.physique}]`,
      character: char,
      stats: getCalculatedStats(char)
    });
  } else {
    // Giữ cũ
    char.physiquePending = null;
    saveDb(db);
    return res.json({
      success: true,
      message: `Đã giữ lại thể chất cũ: [${oldPhysique}]`,
      character: char,
      stats: getCalculatedStats(char)
    });
  }
});

// 6. Lịch Luyện Solo (Đánh thường, x1, x10)
app.post('/api/training/solo', (req, res) => {
  const { name, mode } = req.body; // mode: "X1" | "X10"
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const runs = mode === "X10" ? 10 : 1;
  const cost = runs * 10;

  if (char.stamina < cost) {
    return res.status(400).json({ error: `Không đủ Thể Lực! Cần ${cost} TL, hiện có ${char.stamina} TL.` });
  }

  char.stamina -= cost;

  // Chọn quái phù hợp cảnh giới
  const validMonsters = MONSTERS.filter(m => m.realmMin <= char.realmId);
  const targetMonster = validMonsters[validMonsters.length - 1] || MONSTERS[0];

  let totalExp = 0;
  let totalStones = 0;
  let totalHerbs = 0;
  let winCount = 0;
  let lastCombatLogs = [];

  for (let i = 0; i < runs; i++) {
    const result = simulateCombat(char, targetMonster);
    if (i === runs - 1) lastCombatLogs = result.logs;

    if (result.isWin) {
      winCount++;
      totalExp += targetMonster.exp;
      totalStones += targetMonster.stones;
      if (Math.random() < 0.5) totalHerbs++;
    }
  }

  char.exp += totalExp;
  char.spiritStones += totalStones;
  if (totalHerbs > 0) {
    char.inventory["thao_duoc_linh_chi"] = (char.inventory["thao_duoc_linh_chi"] || 0) + totalHerbs;
  }

  saveDb(db);

  return res.json({
    success: true,
    mode,
    runs,
    winCount,
    monsterName: targetMonster.name,
    totalExp,
    totalStones,
    totalHerbs,
    logs: lastCombatLogs,
    character: char,
    stats: getCalculatedStats(char)
  });
});

// 7. Hồi Máu Đầy Đủ (dùng Dược Liệu / Đan Dược)
app.post('/api/character/heal', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const stats = getCalculatedStats(char);
  char.currentHp = stats.hp;
  saveDb(db);

  return res.json({ success: true, message: "Sinh mệnh đã được phục hồi đầy đủ!", currentHp: char.currentHp });
});

// 8. Nông Trại: Múc Nước Giếng
app.post('/api/farm/well', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const now = Date.now();
  if (char.wellCooldownUntil && char.wellCooldownUntil > now) {
    const leftSec = Math.ceil((char.wellCooldownUntil - now) / 1000);
    return res.status(400).json({ error: `Giếng đang hồi linh khí! Vui lòng chờ ${leftSec}s.` });
  }

  // CD: 4m35s nếu có Cụ Linh Trận, hoặc 10m5s
  const cdSec = char.hasCuLinhTran ? 275 : 605;
  char.wellCooldownUntil = now + (cdSec * 1000);
  char.inventory["nuoc_linh_khi"] = (char.inventory["nuoc_linh_khi"] || 0) + 10;
  saveDb(db);

  return res.json({
    success: true,
    message: "Múc nước giếng thành công! Nhận được +10 Nước Linh Khí.",
    cooldownUntil: char.wellCooldownUntil,
    inventory: char.inventory
  });
});

// 9. Nông Trại: Thao Tác AOE (Tưới nước, Bón phân, Bắt sâu, Thu hoạch)
app.post('/api/farm/action', (req, res) => {
  const { name, gardenType, action } = req.body; // gardenType: 'DAN'|'HOA'|'HIEM', action: 'WATER'|'FERT'|'BUG'|'HARVEST'
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const plots = char.gardens[gardenType];
  if (!plots) return res.status(400).json({ error: "Phân khu không hợp lệ!" });

  let msg = "";
  if (action === "WATER") {
    plots.forEach(p => { p.water = 5; });
    msg = "Tưới Nước AOE thành công! Độ ẩm toàn vườn đạt tối đa (5/5).";
  } else if (action === "FERT") {
    plots.forEach(p => { p.fert = 6; });
    msg = "Bón Phân AOE thành công! Độ màu mỡ toàn vườn đạt tối đa (6/6).";
  } else if (action === "BUG") {
    plots.forEach(p => { p.hasBug = false; });
    msg = "Bắt Sâu AOE thành công! Đã quét sạch sâu bệnh.";
  } else if (action === "HARVEST") {
    let ripeCount = plots.filter(p => p.stage >= 4).length;
    if (ripeCount === 0) {
      return res.status(400).json({ error: "Chưa có ô đất nào chín muồi để thu hoạch!" });
    }
    const herbName = gardenType === 'DAN' ? "thao_duoc_linh_chi" : (gardenType === 'HOA' ? "thao_duoc_hoang_tinh" : "thao_duoc_quy_hiem");
    const earned = ripeCount * 5;
    char.inventory[herbName] = (char.inventory[herbName] || 0) + earned;

    // Reset lại ô đất vừa gặt
    plots.forEach(p => {
      if (p.stage >= 4) {
        p.stage = 0;
        p.water = 0;
        p.fert = 0;
      }
    });
    msg = `Thu Hoạch AOE thành công! Nhận được ${earned}x ${herbName}.`;
  }

  saveDb(db);
  return res.json({ success: true, message: msg, gardens: char.gardens, inventory: char.inventory });
});

// 10. Luyện Đan Phòng
app.post('/api/alchemy/craft', (req, res) => {
  const { name, pillType } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  if (pillType === "DAN_THE_LUC") {
    if ((char.inventory["thao_duoc_linh_chi"] || 0) < 5) {
      return res.status(400).json({ error: "Không đủ nguyên liệu! Cần 5x Linh Chi." });
    }
    char.inventory["thao_duoc_linh_chi"] -= 5;
    char.inventory["dan_the_luc"] = (char.inventory["dan_the_luc"] || 0) + 1;
    saveDb(db);
    return res.json({ success: true, message: "Luyện chế thành công: 1x Thể Lực Đan (+50 TL)!", inventory: char.inventory });
  }

  return res.status(400).json({ error: "Công thức đan dược không hợp lệ!" });
});

// 11. Cắn đan hồi thể lực
app.post('/api/item/use', (req, res) => {
  const { name, itemKey } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  if (!char.inventory[itemKey] || char.inventory[itemKey] <= 0) {
    return res.status(400).json({ error: "Túi đồ không có vật phẩm này!" });
  }

  if (itemKey === "dan_the_luc") {
    char.inventory[itemKey]--;
    char.stamina = Math.min(char.maxStamina, char.stamina + 50);
    saveDb(db);
    return res.json({ success: true, message: "Đã sử dụng Thể Lực Đan! Hồi +50 Thể Lực.", character: char });
  }

  return res.status(400).json({ error: "Chưa hỗ trợ sử dụng vật phẩm này!" });
});

// ================= REALTIME SOCKET.IO =================
io.on('connection', (socket) => {
  // 1. Gia nhập thế giới
  socket.on('world:join', (data) => {
    const charName = (data.name || "").trim();
    if (!charName) return;

    onlineUsers.set(socket.id, charName);
    const onlineList = Array.from(new Set(onlineUsers.values()));

    io.emit('world:online_users', onlineList);
    socket.emit('chat:history', db.chatMessages.slice(-30));
    socket.emit('boss:sync', db.worldBoss);
  });

  // 2. Chat kênh Thế Giới
  socket.on('chat:send', (data) => {
    const { sender, realm, text } = data;
    if (!text || !text.trim()) return;

    const newMsg = {
      id: "msg_" + Date.now(),
      sender: sender || "Vô Danh",
      realm: realm || "Luyện Khí",
      text: text.trim(),
      time: new Date().toLocaleTimeString()
    };

    db.chatMessages.push(newMsg);
    if (db.chatMessages.length > 50) db.chatMessages.shift();

    io.emit('chat:new_message', newMsg);
  });

  // 3. Săn Boss Thế Giới Realtime
  socket.on('boss:attack', (data) => {
    const { charName } = data;
    const key = (charName || "").trim().toLowerCase();
    const char = db.characters[key];
    if (!char || !db.worldBoss.isAlive) return;

    const stats = getCalculatedStats(char);
    const damage = Math.floor(stats.atk * (1.2 + Math.random() * 0.4));

    db.worldBoss.currentHp = Math.max(0, db.worldBoss.currentHp - damage);
    db.worldBoss.dpsTable[char.name] = (db.worldBoss.dpsTable[char.name] || 0) + damage;

    if (db.worldBoss.currentHp <= 0) {
      db.worldBoss.isAlive = false;
      db.worldBoss.respawnAt = Date.now() + (3 * 60 * 1000); // 3 phút sau tái sinh
      io.emit('boss:defeated', { boss: db.worldBoss, killer: char.name });
      io.emit('chat:system', { text: `🏆 [BOSS THẾ GIỚI] Đạo hữu [${char.name}] đã giáng đòn kết liễu ${db.worldBoss.name}!` });
    } else {
      io.emit('boss:damaged', {
        bossName: db.worldBoss.name,
        currentHp: db.worldBoss.currentHp,
        maxHp: db.worldBoss.maxHp,
        attacker: char.name,
        damage,
        dpsTable: db.worldBoss.dpsTable
      });
    }
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    const onlineList = Array.from(new Set(onlineUsers.values()));
    io.emit('world:online_users', onlineList);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌌 TU CHÂN GIỚI (WEB MULTIPLAYER) ĐANG KHỞI CHẠY!`);
  console.log(`🔗 Truy cập ngay: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
