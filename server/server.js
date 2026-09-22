// server/server.js - Máy chủ Express + Socket.io Realtime Tu Chân Giới
// Nâng cấp: Hiệu suất thiền định decay, Bãi săn tự do ngẫu nhiên, Yêu Đan, Công Pháp, Huyết Thú, Đài Độ Kiếp, Tụ Linh Đỉnh
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { readDb, saveDb } = require('./db');
const {
  REALMS,
  PHYSIQUES,
  HUNTING_ZONES,
  RACES_CONFIG,
  SPIRITUAL_ROOTS,
  APTITUDES,
  SKILLS_CONFIG,
  BLOODLINES_CONFIG,
  getAwakeningTier,
  getRaceModifiers,
  rollSpiritualRoot,
  rollAptitude,
  rollPhysique,
  generateWildMonster,
  rollCombatLoot,
  simulateCombat,
  simulateTribulation,
  getMeditationEfficiency,
  getCalculatedStats,
  addPillToxins,
  cleansePillToxins,
  reinforceFoundation,
  createNewCharacter,
  ensureCharacterSchema
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

// Cache bộ nhớ để truy xuất nhanh
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
    ensureCharacterSchema(char);

    let stats = getCalculatedStats(char);

    // CƠ CHẾ NẠP TU VI & TỤ LINH ĐỈNH
    if (char.exp < stats.maxExp) {
      // Chưa đầy: cộng trực tiếp vào tu vi cảnh giới hiện tại (có thể bị nghẽn nếu đan độc >= 80)
      if (stats.expPerSec > 0) {
        char.exp = Math.min(stats.maxExp, char.exp + stats.expPerSec);
        hasUpdate = true;
      }
    } else {
      // ĐÃ ĐẦY 100%: 40% (4/10) nạp vào Tụ Linh Đỉnh & Bồi đắp Căn Cơ!
      const overflowGain = stats.expPerSec * 0.4;
      const maxCap = char.spiritReservoir.maxCapacity || (stats.maxExp * 2);
      if (char.spiritReservoir.storedExp < maxCap) {
        char.spiritReservoir.storedExp = Math.min(maxCap, char.spiritReservoir.storedExp + overflowGain);
        reinforceFoundation(char, overflowGain);
        hasUpdate = true;
      }
    }

    // Tự động thanh lọc đan độc tự nhiên rất chậm (1% mỗi 60s)
    if (!char.lastToxinPurge) char.lastToxinPurge = now;
    if (now - char.lastToxinPurge >= 60000) {
      if (char.foundation && char.foundation.pillToxins > 0) {
        cleansePillToxins(char, 1);
        hasUpdate = true;
      }
      char.lastToxinPurge = now;
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
        if (char.gardens && char.gardens[gType]) {
          char.gardens[gType].forEach(plot => {
            if (plot.stage < 4 && Math.random() < 0.25) {
              plot.stage++;
              hasUpdate = true;
            }
          });
        }
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
    onlineUsers.forEach((name, socketId) => {
      const charKey = name.toLowerCase();
      if (db.characters[charKey]) {
        const c = db.characters[charKey];
        const s = getCalculatedStats(c);
        io.to(socketId).emit('character:tick', {
          exp: c.exp,
          stamina: c.stamina,
          currentHp: c.currentHp,
          gardens: c.gardens,
          spiritReservoir: c.spiritReservoir,
          expPerSec: s.expPerSec,
          meditationEff: s.meditationEff,
          foundation: c.foundation,
          pillToxins: s.pillToxins,
          foundationStability: s.foundationStability
        });
      }
    });
  }
}, 1000);

// ================= REST API ENDPOINTS =================

// 1. Đăng nhập / Tự khởi tạo đạo hiệu nhanh (Chọn Tộc)
app.post('/api/login', (req, res) => {
  const { name, password, race } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Đạo hiệu không được để trống!" });
  }

  const key = name.trim().toLowerCase();
  if (!db.characters[key]) {
    db.characters[key] = createNewCharacter(name, password, race || "Nhan");
    saveDb(db);
  }

  const char = db.characters[key];
  ensureCharacterSchema(char);

  const stats = getCalculatedStats(char);
  return res.json({
    success: true,
    character: char,
    stats,
    huntingZones: HUNTING_ZONES,
    racesConfig: RACES_CONFIG,
    spiritualRoots: SPIRITUAL_ROOTS,
    aptitudes: APTITUDES
  });
});

// 2. Lấy thông tin nhân vật
app.get('/api/character', (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "Thiếu tên nhân vật" });

  const key = name.trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy đạo hữu này!" });
  ensureCharacterSchema(char);

  const stats = getCalculatedStats(char);
  return res.json({
    character: char,
    stats,
    huntingZones: HUNTING_ZONES,
    racesConfig: RACES_CONFIG,
    spiritualRoots: SPIRITUAL_ROOTS,
    aptitudes: APTITUDES
  });
});

// 3. ĐÀI ĐỘ KIẾP LÔI ĐÌNH ("Nơi tu tiên chỉ dung thứ kẻ mạnh")
app.post('/api/tribulation/attempt', (req, res) => {
  const { name, useShieldPill } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const currentStats = getCalculatedStats(char);
  if (char.exp < currentStats.maxExp) {
    return res.status(400).json({ error: "Chưa đủ Tu Vi để tiến hành độ kiếp!" });
  }

  // Nếu người chơi chọn dùng Hộ Mạch Đan
  let shieldUsed = false;
  if (useShieldPill) {
    if ((char.inventory["dan_ho_mach"] || 0) >= 1) {
      char.inventory["dan_ho_mach"]--;
      shieldUsed = true;
    } else {
      return res.status(400).json({ error: "Túi đồ không có Hộ Mạch Đan!" });
    }
  }

  // Chạy mô phỏng Lôi Kiếp
  const tribResult = simulateTribulation(char, shieldUsed);
  if (tribResult.error) {
    return res.status(400).json({ error: tribResult.error });
  }

  if (tribResult.success) {
    // ĐỘ KIẾP THÀNH CÔNG!
    const oldRealmId = char.realmId;
    char.realmId++;
    char.exp = 0;

    // Phân định Trúc Cơ Đạo Cơ (khi từ Luyện Khí 9 lên Trúc Cơ Sơ Kỳ 10)
    if (oldRealmId === 9 && char.realmId === 10) {
      const stability = (char.foundation && char.foundation.stability) || 100;
      const toxins = (char.foundation && char.foundation.pillToxins) || 0;
      if (stability >= 85 && toxins <= 15) {
        char.foundation.grade = "Thiên Đạo Trúc Cơ";
        io.emit('chat:system', {
          text: `🌟 [THIÊN ĐẠO TRÚC CƠ] Đạo hữu [${char.name}] đúc thành Thiên Đạo Trúc Cơ hoàn mỹ vô hà, chân nguyên hóa kim dịch!`
        });
      } else if (stability >= 50) {
        char.foundation.grade = "Địa Phẩm Trúc Cơ";
      } else {
        char.foundation.grade = "Phàm Phẩm Trúc Cơ";
      }
    }

    // Phân định Cửu Phẩm Kim Đan (khi từ Trúc Cơ Viên Mãn 13 lên Kim Đan Sơ Kỳ 14)
    if (oldRealmId === 13 && char.realmId === 14) {
      const stability = (char.foundation && char.foundation.stability) || 100;
      if (char.foundation.grade === "Thiên Đạo Trúc Cơ" && stability >= 80) {
        char.foundation.goldenCore = "Cửu Chuyển Cực Phẩm Kim Đan";
        io.emit('chat:system', {
          text: `⚡ [CỬU CHUYỂN KIM ĐAN] Đạo hữu [${char.name}] kết xuất Cửu Chuyển Cực Phẩm Kim Đan, tử kim quang mang rọi sáng cửu thiên!`
        });
      } else if (stability >= 50) {
        char.foundation.goldenCore = "Địa Phẩm Ngân Đan";
      } else {
        char.foundation.goldenCore = "Hạ Phẩm Hôi Đan";
      }
    }

    // Hồi phục Khí Huyết và tăng Thể Lực
    const newStats = getCalculatedStats(char);
    char.currentHp = newStats.hp;
    char.maxStamina += 10;
    saveDb(db);

    let successMsg = `Độ kiếp thành công! Thăng cấp lên [${newStats.realmName}]`;
    if (tribResult.thanHiBonus) {
      successMsg += ` (Thần Hi Tẩy Thể kích phát: Thể chất tăng thêm +${Math.round(tribResult.thanHiBonus * 100)}%!)`;
    }

    io.emit('chat:system', {
      text: `⚡ [THIÊN ĐỊA DỊ TƯỢNG] Đạo hữu [${char.name}] (${newStats.raceName}) độ qua ${tribResult.totalStrikes} đạo lôi kiếp thành công, phi thăng [${newStats.realmName}]!`
    });

    return res.json({
      success: true,
      message: successMsg,
      tribulation: tribResult,
      character: char,
      stats: newStats
    });
  } else {
    // ĐỘ KIẾP THẤT BẠI - BỊ TRỌNG THƯƠNG
    char.currentHp = 1;
    char.exp = Math.floor(char.exp * 0.8);
    // Căn cơ bị chấn động nhẹ
    if (char.foundation) {
      char.foundation.stability = Math.max(10, (char.foundation.stability || 100) - 10);
    }
    saveDb(db);

    return res.json({
      success: false,
      message: "Độ kiếp thất bại! Bị thiên lôi đánh trọng thương, đan điền chấn động (giảm 10% Độ Vững), hao tổn 20% Tu Vi.",
      tribulation: tribResult,
      character: char,
      stats: getCalculatedStats(char)
    });
  }
});

// 3.1 BẾ QUAN TẨY UẾ (BÀI TRỪ ĐAN ĐỘC & CỦNG CỐ CĂN CƠ)
app.post('/api/foundation/cleanse', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  if (char.stamina < 5) {
    return res.status(400).json({ error: "Không đủ Thể Lực! Cần 5 Thể Lực để bế quan tẩy uế kinh mạch." });
  }

  char.stamina -= 5;
  cleansePillToxins(char, 15);
  reinforceFoundation(char, 1000);
  saveDb(db);

  const stats = getCalculatedStats(char);
  return res.json({
    success: true,
    message: "Bế quan tẩy uế hoàn tất! Đã bài trừ -15% Đan Độc và củng cố +5% Độ Vững Căn Cơ.",
    character: char,
    stats
  });
});

// 4. TRÍCH XUẤT TỤ LINH ĐỈNH (Nạp 40% tu vi tích trữ sang cấp mới)
app.post('/api/reservoir/claim', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  if (!char.spiritReservoir || char.spiritReservoir.storedExp <= 0) {
    return res.status(400).json({ error: "Tụ Linh Đỉnh hiện tại đang trống rỗng!" });
  }

  const stats = getCalculatedStats(char);
  const needed = stats.maxExp - char.exp;
  const stored = Math.floor(char.spiritReservoir.storedExp);

  if (needed <= 0) {
    return res.status(400).json({ error: "Tu vi cảnh giới hiện tại đã đạt 100%! Hãy tiến hành độ kiếp trước." });
  }

  const claimAmt = Math.min(needed, stored);
  char.exp += claimAmt;
  char.spiritReservoir.storedExp -= claimAmt;
  saveDb(db);

  return res.json({
    success: true,
    message: `Đã trích xuất ${claimAmt} Tu Vi từ Tụ Linh Đỉnh vào đan điền!`,
    claimed: claimAmt,
    remainingReservoir: Math.floor(char.spiritReservoir.storedExp),
    character: char,
    stats: getCalculatedStats(char)
  });
});

// 5. BÃI SĂN THEO CẢNH GIỚI (TIERED HUNTING GROUNDS)
app.post('/api/training/hunt', (req, res) => {
  const { name, zoneId, monsterIndex, mode } = req.body; // mode: "X1" | "X10"
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const zone = HUNTING_ZONES.find(z => z.id === zoneId);
  if (!zone) return res.status(400).json({ error: "Bãi săn không tồn tại!" });

  if (char.realmId < zone.minRealm) {
    return res.status(400).json({ error: `Cảnh giới chưa đủ! Cần tối thiểu cảnh giới cấp ${zone.minRealm}.` });
  }

  const targetMonster = zone.monsters[monsterIndex] || zone.monsters[0];
  const runs = mode === "X10" ? 10 : 1;
  const cost = runs * 10;

  if (char.stamina < cost) {
    return res.status(400).json({ error: `Không đủ Thể Lực! Cần ${cost} TL, hiện có ${char.stamina} TL.` });
  }

  char.stamina -= cost;

  let totalExp = 0;
  let totalStones = 0;
  let allDroppedItems = [];
  let winCount = 0;
  let lastCombatLogs = [];

  for (let i = 0; i < runs; i++) {
    const result = simulateCombat(char, targetMonster);
    if (i === runs - 1) lastCombatLogs = result.logs;

    if (result.isWin) {
      winCount++;
      const loot = rollCombatLoot(targetMonster);
      totalExp += loot.exp;
      totalStones += loot.stones;

      loot.items.forEach(it => {
        char.inventory[it.id] = (char.inventory[it.id] || 0) + it.count;
        allDroppedItems.push(it);
      });
    }
  }

  // Cộng Exp: nếu đầy thì nạp 40% vào Tụ Linh Đỉnh
  const stats = getCalculatedStats(char);
  if (char.exp + totalExp <= stats.maxExp) {
    char.exp += totalExp;
  } else {
    const directGain = Math.max(0, stats.maxExp - char.exp);
    const overflow = totalExp - directGain;
    char.exp = stats.maxExp;
    char.spiritReservoir.storedExp = Math.min(
      char.spiritReservoir.maxCapacity || 50000,
      char.spiritReservoir.storedExp + (overflow * 0.4)
    );
  }

  char.spiritStones += totalStones;
  saveDb(db);

  return res.json({
    success: true,
    zoneName: zone.name,
    monsterName: targetMonster.name,
    runs,
    winCount,
    totalExp,
    totalStones,
    droppedItems: allDroppedItems,
    logs: lastCombatLogs,
    character: char,
    stats: getCalculatedStats(char)
  });
});

// 6. BÃI SĂN TỰ DO: DÒ TÌM YÊU THÚ NGẪU NHIÊN (WILD SCOUT)
app.post('/api/training/wild-scout', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const wildMonster = generateWildMonster(char.realmId);
  char.currentWildMonster = wildMonster;
  saveDb(db);

  return res.json({
    success: true,
    message: `Đã phát hiện tung tích yêu thú trong Hỗn Độn Hoang Dã!`,
    monster: wildMonster
  });
});

// 7. BÃI SĂN TỰ DO: KHỞI CHIẾN YÊU THÚ DÒ TÌM ĐƯỢC
app.post('/api/training/wild-fight', (req, res) => {
  const { name } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  if (!char.currentWildMonster) {
    return res.status(400).json({ error: "Chưa có tung tích yêu thú nào! Hãy bấm [Dò Tìm Yêu Thú] trước." });
  }

  const COST = 15;
  if (char.stamina < COST) {
    return res.status(400).json({ error: `Không đủ Thể Lực! Cần ${COST} TL để khiêu chiến quái hoang dã.` });
  }

  char.stamina -= COST;
  const monster = char.currentWildMonster;
  const result = simulateCombat(char, monster);

  let droppedItems = [];
  let totalExp = 0;
  let totalStones = 0;

  if (result.isWin) {
    const loot = rollCombatLoot(monster);
    totalExp = loot.exp;
    totalStones = loot.stones;

    loot.items.forEach(it => {
      char.inventory[it.id] = (char.inventory[it.id] || 0) + it.count;
      droppedItems.push(it);
    });

    const stats = getCalculatedStats(char);
    if (char.exp + totalExp <= stats.maxExp) {
      char.exp += totalExp;
    } else {
      const directGain = Math.max(0, stats.maxExp - char.exp);
      const overflow = totalExp - directGain;
      char.exp = stats.maxExp;
      char.spiritReservoir.storedExp = Math.min(
        char.spiritReservoir.maxCapacity || 50000,
        char.spiritReservoir.storedExp + (overflow * 0.4)
      );
    }

    char.spiritStones += totalStones;
    char.currentWildMonster = null; // Diệt xong thì xóa dấu vết
    saveDb(db);

    return res.json({
      success: true,
      isWin: true,
      monsterName: monster.name,
      totalExp,
      totalStones,
      droppedItems,
      logs: result.logs,
      character: char,
      stats: getCalculatedStats(char)
    });
  } else {
    // Thua trận
    char.currentHp = Math.max(1, Math.floor(char.currentHp * 0.5));
    saveDb(db);

    return res.json({
      success: true,
      isWin: false,
      monsterName: monster.name,
      logs: result.logs,
      message: `Không địch lại [${monster.name}]! Đành phải chật vật chạy trốn, tổn hao sinh mệnh.`,
      character: char,
      stats: getCalculatedStats(char)
    });
  }
});

// 8. LĨNH NGỘ CÔNG PHÁP (TĂNG VĨNH VIỄN CHỈ SỐ)
app.post('/api/skills/learn', (req, res) => {
  const { name, skillId } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const skill = SKILLS_CONFIG[skillId];
  if (!skill) return res.status(400).json({ error: "Bí kíp công pháp không tồn tại!" });

  if ((char.inventory[skillId] || 0) < 1) {
    return res.status(400).json({ error: "Túi đồ không có bí tịch này!" });
  }

  if (char.learnedSkills && char.learnedSkills.includes(skillId)) {
    return res.status(400).json({ error: "Đạo hữu đã lĩnh ngộ công pháp này rồi!" });
  }

  char.inventory[skillId]--;
  if (!char.learnedSkills) char.learnedSkills = [];
  char.learnedSkills.push(skillId);
  saveDb(db);

  const stats = getCalculatedStats(char);
  return res.json({
    success: true,
    message: `Lĩnh ngộ thành công [${skill.name}]! ${skill.desc}`,
    character: char,
    stats
  });
});

// 9. LUYỆN HÓA HUYẾT THÚ (THỐI THỂ, TĂNG MÁU, HÚT MÁU, KHÁNG LÔI)
app.post('/api/bloodline/refine', (req, res) => {
  const { name, bloodlineId } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  const blood = BLOODLINES_CONFIG[bloodlineId];
  if (!blood) return res.status(400).json({ error: "Tinh huyết này không tồn tại!" });

  if ((char.inventory[bloodlineId] || 0) < 1) {
    return res.status(400).json({ error: "Túi đồ không có tinh huyết này!" });
  }

  if (char.absorbedBloodlines && char.absorbedBloodlines.includes(bloodlineId)) {
    return res.status(400).json({ error: "Đạo hữu đã tôi luyện huyết mạch này rồi!" });
  }

  char.inventory[bloodlineId]--;
  if (!char.absorbedBloodlines) char.absorbedBloodlines = [];
  char.absorbedBloodlines.push(bloodlineId);
  saveDb(db);

  const stats = getCalculatedStats(char);
  return res.json({
    success: true,
    message: `Thối thể luyện hóa thành công [${blood.name}]! ${blood.desc}`,
    character: char,
    stats
  });
});

// 10. TẨY TỦY THỂ CHẤT
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

// 11. XÁC NHẬN THỂ CHẤT MỚI HOẶC GIỮ CŨ
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

// 12. HỒI PHỤC TOÀN BỘ KHÍ HUYẾT
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

// 13. NÔNG TRẠI: MÚC NƯỚC GIẾNG LINH TUYỀN
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

// 14. NÔNG TRẠI: THAO TÁC AOE
app.post('/api/farm/action', (req, res) => {
  const { name, gardenType, action } = req.body;
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

// 15. LUYỆN ĐAN PHÒNG
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

  if (pillType === "DAN_HO_MACH") {
    if ((char.inventory["thao_duoc_linh_chi"] || 0) < 8 || (char.inventory["nuoc_linh_khi"] || 0) < 5) {
      return res.status(400).json({ error: "Cần 8x Linh Chi và 5x Nước Linh Khí để luyện Hộ Mạch Đan!" });
    }
    char.inventory["thao_duoc_linh_chi"] -= 8;
    char.inventory["nuoc_linh_khi"] -= 5;
    char.inventory["dan_ho_mach"] = (char.inventory["dan_ho_mach"] || 0) + 1;
    saveDb(db);
    return res.json({ success: true, message: "Luyện chế thành công: 1x Hộ Mạch Đan (Giảm 40% sát thương Lôi Kiếp)!", inventory: char.inventory });
  }

  if (pillType === "DAN_TU_KHI") {
    if ((char.inventory["yeu_dan_1"] || 0) < 1 || (char.inventory["thao_duoc_linh_chi"] || 0) < 5) {
      return res.status(400).json({ error: "Cần 1x Yêu Đan Giai 1 và 5x Linh Chi!" });
    }
    char.inventory["yeu_dan_1"] -= 1;
    char.inventory["thao_duoc_linh_chi"] -= 5;
    char.inventory["dan_tu_khi"] = (char.inventory["dan_tu_khi"] || 0) + 1;
    saveDb(db);
    return res.json({ success: true, message: "Luyện chế thành công: 1x Tụ Khí Đan (+500 Tu Vi)!", inventory: char.inventory });
  }

  if (pillType === "DAN_TRUC_CO") {
    if ((char.inventory["yeu_dan_2"] || 0) < 1 || (char.inventory["thao_duoc_hoang_tinh"] || 0) < 8) {
      return res.status(400).json({ error: "Cần 1x Yêu Đan Giai 2 và 8x Hoàng Tinh!" });
    }
    char.inventory["yeu_dan_2"] -= 1;
    char.inventory["thao_duoc_hoang_tinh"] -= 8;
    char.inventory["dan_truc_co"] = (char.inventory["dan_truc_co"] || 0) + 1;
    saveDb(db);
    return res.json({ success: true, message: "Luyện chế thành công: 1x Trúc Cơ Linh Đan (+3,000 Tu Vi)!", inventory: char.inventory });
  }

  if (pillType === "DAN_TAY_TUY") {
    if ((char.inventory["thao_duoc_linh_chi"] || 0) < 10 || (char.inventory["nuoc_linh_khi"] || 0) < 5) {
      return res.status(400).json({ error: "Cần 10x Linh Chi và 5x Nước Linh Khí để luyện Tẩy Tủy Đan!" });
    }
    char.inventory["thao_duoc_linh_chi"] -= 10;
    char.inventory["nuoc_linh_khi"] -= 5;
    char.inventory["dan_tay_tuy"] = (char.inventory["dan_tay_tuy"] || 0) + 1;
    saveDb(db);
    return res.json({ success: true, message: "Luyện chế thành công: 1x Tẩy Tủy Đan (Thanh trừ 25% Đan Độc)!", inventory: char.inventory });
  }

  return res.status(400).json({ error: "Công thức đan dược không hợp lệ!" });
});

// 16. SỬ DỤNG VẬT PHẨM & CẮN ĐAN TU VI TỨC THÌ
app.post('/api/item/use', (req, res) => {
  const { name, itemKey } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

  if (!char.inventory[itemKey] || char.inventory[itemKey] <= 0) {
    return res.status(400).json({ error: "Túi đồ không có vật phẩm này!" });
  }

  // Khởi tạo căn cơ nếu chưa có
  if (!char.foundation) {
    char.foundation = { purity: 100, stability: 100, pillToxins: 0, grade: "Phàm Phẩm Trúc Cơ" };
  }

  let expGain = 0;
  let msg = "";

  if (itemKey === "dan_the_luc") {
    char.inventory[itemKey]--;
    char.stamina = Math.min(char.maxStamina, char.stamina + 50);
    addPillToxins(char, 1);
    msg = "Đã cắn Thể Lực Đan! Hồi +50 Thể Lực. (+1% Đan Độc)";
  } else if (itemKey === "dan_hoi_mau") {
    char.inventory[itemKey]--;
    const stats = getCalculatedStats(char);
    char.currentHp = stats.hp;
    addPillToxins(char, 1);
    msg = "Đã cắn Hồi Huyết Đan! Khí Huyết hồi phục 100%. (+1% Đan Độc)";
  } else if (itemKey === "dan_tu_khi") {
    if (char.foundation.pillToxins >= 80) {
      return res.status(400).json({ error: "Đan Điền Bế Tắc (Đan Độc >= 80%)! Hãy Bế Quan Tẩy Uế hoặc dùng Tẩy Tủy Đan trước!" });
    }
    char.inventory[itemKey]--;
    expGain = 500;
    addPillToxins(char, 3);
    msg = "Cắn Tụ Khí Đan! Đan điền hấp thu +500 Tu Vi. (+3% Đan Độc)";
  } else if (itemKey === "dan_truc_co") {
    if (char.foundation.pillToxins >= 80) {
      return res.status(400).json({ error: "Đan Điền Bế Tắc (Đan Độc >= 80%)! Hãy Bế Quan Tẩy Uế hoặc dùng Tẩy Tủy Đan trước!" });
    }
    char.inventory[itemKey]--;
    expGain = 3000;
    addPillToxins(char, 5);
    msg = "Cắn Trúc Cơ Linh Đan! Đan điền hấp thu +3,000 Tu Vi. (+5% Đan Độc)";
  } else if (itemKey === "dan_tu_nguyen") {
    if (char.foundation.pillToxins >= 80) {
      return res.status(400).json({ error: "Đan Điền Bế Tắc (Đan Độc >= 80%)! Hãy Bế Quan Tẩy Uế hoặc dùng Tẩy Tủy Đan trước!" });
    }
    char.inventory[itemKey]--;
    expGain = 15000;
    addPillToxins(char, 8);
    msg = "Cắn Kim Đan Tụ Nguyên Đan! Đan điền hấp thu +15,000 Tu Vi. (+8% Đan Độc)";
  } else if (itemKey === "dan_hoa_anh") {
    if (char.foundation.pillToxins >= 80) {
      return res.status(400).json({ error: "Đan Điền Bế Tắc (Đan Độc >= 80%)! Hãy Bế Quan Tẩy Uế hoặc dùng Tẩy Tủy Đan trước!" });
    }
    char.inventory[itemKey]--;
    expGain = 50000;
    addPillToxins(char, 12);
    msg = "Cắn Hóa Anh Đan! Đan điền bộc phát +50,000 Tu Vi! (+12% Đan Độc)";
  } else if (itemKey.startsWith("yeu_dan_")) {
    if (char.foundation.pillToxins >= 80) {
      return res.status(400).json({ error: "Đan Điền Bế Tắc (Đan Độc >= 80%)! Hãy Bế Quan Tẩy Uế hoặc dùng Tẩy Tủy Đan trước!" });
    }
    char.inventory[itemKey]--;
    const tier = parseInt(itemKey.replace("yeu_dan_", "")) || 1;
    const tierExp = [0, 200, 1000, 5000, 20000, 80000];
    expGain = tierExp[tier] || 200;
    addPillToxins(char, 4);
    msg = `Luyện hóa Yêu Đan Giai ${tier}! Chuyển hóa được +${expGain} Tu Vi. (+4% Đan Độc)`;
  } else if (itemKey === "dan_tay_tuy") {
    char.inventory[itemKey]--;
    cleansePillToxins(char, 25);
    msg = "Đã cắn Tẩy Tủy Đan! Gột rửa kinh mạch, thanh trừ -25% Đan Độc.";
  } else {
    return res.status(400).json({ error: "Vật phẩm này không thể cắn trực tiếp!" });
  }

  // Nếu có Exp gain: cộng tu vi và nạp 40% vào Tụ Linh Đỉnh nếu đầy
  if (expGain > 0) {
    const stats = getCalculatedStats(char);
    if (char.exp + expGain <= stats.maxExp) {
      char.exp += expGain;
    } else {
      const direct = Math.max(0, stats.maxExp - char.exp);
      const overflow = expGain - direct;
      char.exp = stats.maxExp;
      char.spiritReservoir.storedExp = Math.min(
        char.spiritReservoir.maxCapacity || 50000,
        char.spiritReservoir.storedExp + (overflow * 0.4)
      );
      reinforceFoundation(char, overflow * 0.4);
    }
  }

  saveDb(db);
  return res.json({
    success: true,
    message: msg,
    character: char,
    stats: getCalculatedStats(char)
  });
});

// 18. TÀNG BẢO KHỐ ĐỘNG PHỦ 500 Ô (Chuyển đồ qua lại giữa Túi & Kho - Doc 21)
app.post('/api/vault/transfer', (req, res) => {
  const { name, itemId, quantity, toVault } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });
  ensureCharacterSchema(char);

  const qty = parseInt(quantity) || 1;
  if (qty <= 0) return res.status(400).json({ error: "Số lượng không hợp lệ!" });

  if (toVault) {
    if (!char.inventory[itemId] || char.inventory[itemId] < qty) {
      return res.status(400).json({ error: "Túi đồ không đủ vật phẩm!" });
    }
    char.inventory[itemId] -= qty;
    if (char.inventory[itemId] <= 0) delete char.inventory[itemId];
    char.vault[itemId] = (char.vault[itemId] || 0) + qty;
  } else {
    if (!char.vault[itemId] || char.vault[itemId] < qty) {
      return res.status(400).json({ error: "Tàng Bảo Khố không đủ vật phẩm!" });
    }
    char.vault[itemId] -= qty;
    if (char.vault[itemId] <= 0) delete char.vault[itemId];
    char.inventory[itemId] = (char.inventory[itemId] || 0) + qty;
  }
  saveDb(db);
  return res.json({ success: true, character: char });
});

// 19. LỤC VỊ TRANG BỊ BẢN MỆNH (Trang bị / Gỡ pháp khí - Doc 21 & 23)
app.post('/api/character/equip', (req, res) => {
  const { name, itemId, slot, isUnequip } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });
  ensureCharacterSchema(char);

  const validSlots = ["weapon", "armor", "boots", "amulet", "ring", "relic"];
  if (!validSlots.includes(slot)) {
    return res.status(400).json({ error: "Vị trí trang bị không hợp lệ!" });
  }

  if (isUnequip) {
    const current = char.equippedArtifacts[slot];
    if (current) {
      char.inventory[current] = (char.inventory[current] || 0) + 1;
      char.equippedArtifacts[slot] = null;
    }
  } else {
    if (!char.inventory[itemId] || char.inventory[itemId] <= 0) {
      return res.status(400).json({ error: "Không có vật phẩm này trong hành trang!" });
    }
    const old = char.equippedArtifacts[slot];
    if (old) {
      char.inventory[old] = (char.inventory[old] || 0) + 1;
    }
    char.inventory[itemId] -= 1;
    if (char.inventory[itemId] <= 0) delete char.inventory[itemId];
    char.equippedArtifacts[slot] = itemId;
  }
  saveDb(db);
  return res.json({ success: true, character: char, stats: getCalculatedStats(char) });
});

// 20. BÁT QUÁI ĐẠO ĐÀI (Trang bị 6 ô Bí Tịch Công Pháp - Doc 22)
app.post('/api/skills/equip-daodai', (req, res) => {
  const { name, skillId, slotIndex } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });
  ensureCharacterSchema(char);

  const idx = parseInt(slotIndex);
  if (idx < 0 || idx > 5) return res.status(400).json({ error: "Ô Bát Quái Đạo Đài chỉ từ 0 đến 5!" });

  if (skillId) {
    if (!char.learnedSkills.includes(skillId)) {
      return res.status(400).json({ error: "Đạo hữu chưa lĩnh ngộ công pháp này!" });
    }
    for (let i = 0; i < 6; i++) {
      if (char.equippedSkills[i] === skillId) char.equippedSkills[i] = null;
    }
    char.equippedSkills[idx] = skillId;
  } else {
    char.equippedSkills[idx] = null;
  }
  saveDb(db);
  return res.json({ success: true, character: char });
});

// 21. TIÊN TÍN HÒM THƯ (Nhận quà đính kèm - Doc 25)
app.post('/api/mail/claim', (req, res) => {
  const { name, mailId } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });
  ensureCharacterSchema(char);

  const mail = (char.mailbox || []).find(m => m.id === mailId);
  if (!mail) return res.status(404).json({ error: "Không tìm thấy phong thư này!" });
  if (mail.isClaimed) return res.status(400).json({ error: "Vật phẩm trong thư đã nhận rồi!" });

  if (mail.attachedStones) {
    char.spiritStones = (char.spiritStones || 0) + mail.attachedStones;
  }
  if (mail.attachedItems && Array.isArray(mail.attachedItems)) {
    mail.attachedItems.forEach(item => {
      char.inventory[item.itemId] = (char.inventory[item.itemId] || 0) + (item.quantity || 1);
    });
  }
  mail.isClaimed = true;
  mail.isRead = true;
  saveDb(db);
  return res.json({ success: true, message: "Đã nhận quà từ phong thư thành công!", character: char });
});

// 22. HUYỀN THƯỞNG BẢNG (Nhận thưởng nhiệm vụ hàng ngày - Doc 26)
app.post('/api/bounty/claim', (req, res) => {
  const { name, bountyId } = req.body;
  const key = (name || "").trim().toLowerCase();
  const char = db.characters[key];
  if (!char) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });
  ensureCharacterSchema(char);

  const bounty = (char.dailyBounties || []).find(b => b.id === bountyId);
  if (!bounty) return res.status(404).json({ error: "Không tìm thấy nhiệm vụ này!" });
  if (bounty.isClaimed) return res.status(400).json({ error: "Nhiệm vụ này đã nhận thưởng!" });

  char.exp = (char.exp || 0) + (bounty.rewardExp || 0);
  char.spiritStones = (char.spiritStones || 0) + (bounty.rewardStones || 0);
  bounty.isClaimed = true;
  saveDb(db);
  return res.json({
    success: true,
    message: `Nhận thưởng thành công: +${bounty.rewardExp} Tu Vi, +${bounty.rewardStones} Linh Thạch!`,
    character: char,
    stats: getCalculatedStats(char)
  });
});

// 23. LUẬN ĐẠO LÔI ĐÀI (Phát chiến thư PvP 1v1 - Doc 24)
app.post('/api/pvp/challenge', (req, res) => {
  const { challengerName, targetName, wagerStones } = req.body;
  const cKey = (challengerName || "").trim().toLowerCase();
  const tKey = (targetName || "").trim().toLowerCase();
  const challenger = db.characters[cKey];
  const target = db.characters[tKey];
  if (!challenger || !target) return res.status(404).json({ error: "Không tìm thấy nhân vật tham gia!" });

  const wager = parseInt(wagerStones) || 0;
  if (challenger.spiritStones < wager) {
    return res.status(400).json({ error: "Linh thạch của đạo hữu không đủ để đặt cược!" });
  }

  io.emit('pvp:challenge_popup', {
    challenger: challenger.name,
    target: target.name,
    wagerStones: wager
  });

  return res.json({
    success: true,
    message: `Đã phát chiến thư luận đạo tới đạo hữu [${target.name}] với mức cược ${wager} Linh Thạch!`
  });
});

// ================= REALTIME SOCKET.IO =================
io.on('connection', (socket) => {
  socket.on('world:join', (data) => {
    const charName = (data.name || "").trim();
    if (!charName) return;

    onlineUsers.set(socket.id, charName);
    const onlineList = Array.from(new Set(onlineUsers.values()));

    io.emit('world:online_users', onlineList);
    socket.emit('chat:history', db.chatMessages.slice(-30));
    socket.emit('boss:sync', db.worldBoss);
  });

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
      db.worldBoss.respawnAt = Date.now() + (3 * 60 * 1000);
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
