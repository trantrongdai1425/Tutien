// server/gameEngine.js - Động cơ tính toán logic toàn bộ Game Tu Tiên

// 1. HỆ THỐNG CẢNH GIỚI
const REALMS = [
  // Luyện Khí Tầng 1 -> 9
  { id: 1, name: "Luyện Khí Tầng 1", maxExp: 100, expPerSec: 1, hp: 500, atk: 50, def: 25, speed: 10 },
  { id: 2, name: "Luyện Khí Tầng 2", maxExp: 200, expPerSec: 1.5, hp: 600, atk: 65, def: 32, speed: 11 },
  { id: 3, name: "Luyện Khí Tầng 3", maxExp: 350, expPerSec: 2, hp: 720, atk: 80, def: 40, speed: 12 },
  { id: 4, name: "Luyện Khí Tầng 4", maxExp: 550, expPerSec: 2.5, hp: 860, atk: 100, def: 50, speed: 13 },
  { id: 5, name: "Luyện Khí Tầng 5", maxExp: 800, expPerSec: 3, hp: 1020, atk: 125, def: 62, speed: 14 },
  { id: 6, name: "Luyện Khí Tầng 6", maxExp: 1150, expPerSec: 3.5, hp: 1200, atk: 155, def: 77, speed: 15 },
  { id: 7, name: "Luyện Khí Tầng 7", maxExp: 1600, expPerSec: 4, hp: 1400, atk: 190, def: 95, speed: 16 },
  { id: 8, name: "Luyện Khí Tầng 8", maxExp: 2200, expPerSec: 4.5, hp: 1650, atk: 230, def: 115, speed: 17 },
  { id: 9, name: "Luyện Khí Tầng 9 (Đỉnh Phong)", maxExp: 3000, expPerSec: 5, hp: 2000, atk: 280, def: 140, speed: 18 },

  // Trúc Cơ
  { id: 10, name: "Trúc Cơ Sơ Kỳ", maxExp: 6000, expPerSec: 10, hp: 3500, atk: 450, def: 220, speed: 22 },
  { id: 11, name: "Trúc Cơ Trung Kỳ", maxExp: 12000, expPerSec: 15, hp: 5000, atk: 650, def: 320, speed: 25 },
  { id: 12, name: "Trúc Cơ Hậu Kỳ", maxExp: 20000, expPerSec: 20, hp: 7000, atk: 900, def: 450, speed: 28 },
  { id: 13, name: "Trúc Cơ Viên Mãn", maxExp: 32000, expPerSec: 25, hp: 9500, atk: 1200, def: 600, speed: 32 },

  // Kim Đan
  { id: 14, name: "Kim Đan Sơ Kỳ", maxExp: 60000, expPerSec: 50, hp: 15000, atk: 2000, def: 1000, speed: 40 },
  { id: 15, name: "Kim Đan Trung Kỳ", maxExp: 100000, expPerSec: 70, hp: 22000, atk: 2900, def: 1450, speed: 45 },
  { id: 16, name: "Kim Đan Hậu Kỳ", maxExp: 160000, expPerSec: 90, hp: 30000, atk: 4000, def: 2000, speed: 50 },
  { id: 17, name: "Kim Đan Viên Mãn", maxExp: 250000, expPerSec: 120, hp: 42000, atk: 5500, def: 2750, speed: 55 },

  // Nguyên Anh
  { id: 18, name: "Nguyên Anh Sơ Kỳ", maxExp: 450000, expPerSec: 200, hp: 65000, atk: 8500, def: 4200, speed: 65 },
  { id: 19, name: "Nguyên Anh Trung Kỳ", maxExp: 750000, expPerSec: 280, hp: 95000, atk: 12500, def: 6200, speed: 75 },
  { id: 20, name: "Nguyên Anh Hậu Kỳ", maxExp: 1200000, expPerSec: 380, hp: 135000, atk: 18000, def: 9000, speed: 85 },
  { id: 21, name: "Nguyên Anh Viên Mãn", maxExp: 1800000, expPerSec: 500, hp: 185000, atk: 25000, def: 12500, speed: 95 },

  // Hóa Thần
  { id: 22, name: "Hóa Thần Sơ Kỳ", maxExp: 3000000, expPerSec: 800, hp: 260000, atk: 35000, def: 17500, speed: 110 },
  { id: 23, name: "Hóa Thần Trung Kỳ", maxExp: 4500000, expPerSec: 1100, hp: 360000, atk: 48000, def: 24000, speed: 125 },
  { id: 24, name: "Hóa Thần Hậu Kỳ", maxExp: 6500000, expPerSec: 1500, hp: 480000, atk: 65000, def: 32500, speed: 140 },
  { id: 25, name: "Hóa Thần Viên Mãn", maxExp: 9000000, expPerSec: 2000, hp: 620000, atk: 85000, def: 42500, speed: 155 },

  // Luyện Hư (Bắt đầu đi Bí Cảnh Luyện Hư)
  { id: 26, name: "Luyện Hư Sơ Kỳ", maxExp: 14000000, expPerSec: 3000, hp: 850000, atk: 120000, def: 60000, speed: 180 },
  { id: 27, name: "Luyện Hư Trung Kỳ", maxExp: 20000000, expPerSec: 4200, hp: 1150000, atk: 165000, def: 82500, speed: 200 },
  { id: 28, name: "Luyện Hư Hậu Kỳ", maxExp: 30000000, expPerSec: 5800, hp: 1550000, atk: 220000, def: 110000, speed: 225 },
  { id: 29, name: "Luyện Hư Viên Mãn", maxExp: 45000000, expPerSec: 8000, hp: 2100000, atk: 300000, def: 150000, speed: 250 },

  // Hợp Thể
  { id: 30, name: "Hợp Thể Đỉnh Phong", maxExp: 100000000, expPerSec: 15000, hp: 4000000, atk: 550000, def: 275000, speed: 300 },
  // Đại Thừa
  { id: 31, name: "Đại Thừa Đỉnh Phong", maxExp: 300000000, expPerSec: 30000, hp: 8000000, atk: 1100000, def: 550000, speed: 400 },
  // Độ Kiếp
  { id: 32, name: "Độ Kiếp Kỳ (Chân Tiên)", maxExp: 999999999, expPerSec: 60000, hp: 20000000, atk: 3000000, def: 1500000, speed: 500 }
];

// 2. HỆ THỐNG THỂ CHẤT (PHYSIQUES)
const PHYSIQUES = [
  // Phàm thể (50%)
  { name: "Phàm Thai Nhục Thân", rank: "Phàm", color: "#9e9e9e", atkBonus: 0, defBonus: 0, hpBonus: 0, expRateBonus: 0 },
  { name: "Bì Đao Phàm Thể", rank: "Phàm", color: "#9e9e9e", atkBonus: 0.05, defBonus: 0.02, hpBonus: 0.02, expRateBonus: 0 },
  { name: "Thiết Cốt Phàm Thể", rank: "Phàm", color: "#9e9e9e", atkBonus: 0.02, defBonus: 0.06, hpBonus: 0.03, expRateBonus: 0 },

  // Linh thể (30%)
  { name: "Mộc Linh Thể", rank: "Linh", color: "#4caf50", atkBonus: 0.1, defBonus: 0.08, hpBonus: 0.15, expRateBonus: 0.1 },
  { name: "Kim Cương Linh Thể", rank: "Linh", color: "#2196f3", atkBonus: 0.08, defBonus: 0.2, hpBonus: 0.15, expRateBonus: 0.08 },
  { name: "Liệt Hỏa Linh Thể", rank: "Linh", color: "#ff9800", atkBonus: 0.22, defBonus: 0.05, hpBonus: 0.08, expRateBonus: 0.1 },
  { name: "Huyền Thủy Linh Thể", rank: "Linh", color: "#00bcd4", atkBonus: 0.12, defBonus: 0.12, hpBonus: 0.18, expRateBonus: 0.12 },

  // Vương thể (14%)
  { name: "Cửu Dương Vương Thể", rank: "Vương", color: "#9c27b0", atkBonus: 0.35, defBonus: 0.2, hpBonus: 0.25, expRateBonus: 0.2 },
  { name: "Băng Phách Vương Thể", rank: "Vương", color: "#3f51b5", atkBonus: 0.3, defBonus: 0.3, hpBonus: 0.25, expRateBonus: 0.2 },
  { name: "Chiến Thần Vương Thể", rank: "Vương", color: "#e91e63", atkBonus: 0.45, defBonus: 0.15, hpBonus: 0.3, expRateBonus: 0.25 },

  // Thánh thể (5%) - Điểm ngắt mà auto macro tìm kiếm
  { name: "Hoang Cổ Thánh Thể", rank: "Thánh", color: "#ffd700", atkBonus: 0.8, defBonus: 0.6, hpBonus: 0.8, expRateBonus: 0.4 },
  { name: "Thái Âm Thánh Thể", rank: "Thánh", color: "#ffd700", atkBonus: 0.75, defBonus: 0.65, hpBonus: 0.75, expRateBonus: 0.45 },
  { name: "Bất Diệt Thánh Thể", rank: "Thánh", color: "#ffd700", atkBonus: 0.6, defBonus: 1.0, hpBonus: 1.2, expRateBonus: 0.4 },
  { name: "Vạn Kiếp Thánh Thể", rank: "Thánh", color: "#ffd700", atkBonus: 0.9, defBonus: 0.5, hpBonus: 0.7, expRateBonus: 0.5 },

  // Thần thể (1%) - Đỉnh phong tu đạo
  { name: "Hỗn Độn Thể", rank: "Thần", color: "#ff3b30", atkBonus: 1.5, defBonus: 1.2, hpBonus: 1.5, expRateBonus: 1.0 },
  { name: "Tiên Thiên Đạo Thể", rank: "Thần", color: "#ff3b30", atkBonus: 1.3, defBonus: 1.3, hpBonus: 1.4, expRateBonus: 1.2 },
  { name: "Chí Tôn Thần Thể", rank: "Thần", color: "#ff3b30", atkBonus: 1.8, defBonus: 1.0, hpBonus: 1.3, expRateBonus: 0.9 }
];

// Hàm quay Tẩy Tủy
function rollPhysique() {
  const rand = Math.random() * 100;
  let targetRank = "Phàm";
  if (rand < 1) targetRank = "Thần"; // 1%
  else if (rand < 6) targetRank = "Thánh"; // 5%
  else if (rand < 20) targetRank = "Vương"; // 14%
  else if (rand < 50) targetRank = "Linh"; // 30%
  else targetRank = "Phàm"; // 50%

  const candidates = PHYSIQUES.filter(p => p.rank === targetRank);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// 3. NGŨ HÀNH & TƯƠNG KHẮC
const ELEMENTS = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];
const COUNTER_MAP = {
  "Kim": "Mộc",
  "Mộc": "Thổ",
  "Thổ": "Thủy",
  "Thủy": "Hỏa",
  "Hỏa": "Kim"
};

function getCounterBonus(elemA, elemB) {
  if (COUNTER_MAP[elemA] === elemB) return 1.25; // A khắc B (+25%)
  if (COUNTER_MAP[elemB] === elemA) return 0.85; // A bị B khắc (-15%)
  return 1.0;
}

// 4. QUÁI VẬT LỊCH LUYỆN
const MONSTERS = [
  { realmMin: 1, name: "Hỏa Sí Ma Lang", element: "Hỏa", hp: 300, atk: 35, def: 15, exp: 50, stones: 30 },
  { realmMin: 3, name: "Thanh Mãng Xà Tinh", element: "Mộc", hp: 650, atk: 70, def: 35, exp: 120, stones: 70 },
  { realmMin: 6, name: "Hắc Thủy Cự Hạt", element: "Thủy", hp: 1300, atk: 140, def: 70, exp: 250, stones: 150 },
  { realmMin: 10, name: "Thiết Bối Hùng Vương", element: "Thổ", hp: 3500, atk: 400, def: 250, exp: 700, stones: 400 },
  { realmMin: 14, name: "Kim Sí Điêu Vương", element: "Kim", hp: 15000, atk: 1800, def: 1000, exp: 2000, stones: 1200 },
  { realmMin: 18, name: "Xích Diễm Ma Giao", element: "Hỏa", hp: 60000, atk: 7500, def: 4000, exp: 6000, stones: 4000 },
  { realmMin: 22, name: "U Minh Bạch Hổ", element: "Kim", hp: 220000, atk: 30000, def: 16000, exp: 18000, stones: 12000 },
  { realmMin: 26, name: "Thái Cổ Cự Kình", element: "Thủy", hp: 800000, atk: 110000, def: 55000, exp: 50000, stones: 35000 }
];

// Hàm mô phỏng giao tranh (Turn-based Combat)
function simulateCombat(char, monster) {
  let pStats = getCalculatedStats(char);
  let playerHp = pStats.hp;
  let monsterHp = monster.hp;
  let logs = [];
  let round = 1;

  const playerCounter = getCounterBonus(char.element, monster.element);
  const monsterCounter = getCounterBonus(monster.element, char.element);

  while (playerHp > 0 && monsterHp > 0 && round <= 25) {
    // Lượt người chơi
    let isCrit = Math.random() < 0.15;
    let baseDmg = Math.max(5, (pStats.atk * 1.0) - (monster.def * 0.4));
    let finalDmg = Math.floor(baseDmg * playerCounter * (isCrit ? 1.5 : 1.0));
    monsterHp -= finalDmg;
    logs.push(`Hiệp ${round}: [${char.name}] xuất chiêu đánh trúng [${monster.name}] gây ${finalDmg} sát thương!${isCrit ? " 💥 (BẠO KÍCH!)" : ""}`);

    if (monsterHp <= 0) break;

    // Lượt quái thú
    let mBaseDmg = Math.max(5, (monster.atk * 1.0) - (pStats.def * 0.45));
    let mFinalDmg = Math.floor(mBaseDmg * monsterCounter);
    playerHp -= mFinalDmg;
    logs.push(`Hiệp ${round}: [${monster.name}] phản kích, gây ${mFinalDmg} sát thương lên [${char.name}].`);

    round++;
  }

  const isWin = monsterHp <= 0 && playerHp > 0;
  return {
    isWin,
    remainingPlayerHp: Math.max(0, playerHp),
    remainingMonsterHp: Math.max(0, monsterHp),
    rounds: round,
    logs
  };
}

// 5. CÔNG THỨC TÍNH CHỈ SỐ TỔNG HỢP (Base Realm + Physique Buff)
function getCalculatedStats(char) {
  const realm = REALMS.find(r => r.id === char.realmId) || REALMS[0];
  const physique = PHYSIQUES.find(p => p.name === char.physique) || PHYSIQUES[0];

  const hp = Math.floor(realm.hp * (1 + physique.hpBonus));
  const atk = Math.floor(realm.atk * (1 + physique.atkBonus));
  const def = Math.floor(realm.def * (1 + physique.defBonus));
  const speed = realm.speed;
  const expPerSec = Number((realm.expPerSec * (1 + physique.expRateBonus)).toFixed(1));

  return {
    hp,
    atk,
    def,
    speed,
    expPerSec,
    realmName: realm.name,
    maxExp: realm.maxExp
  };
}

// 6. KHỞI TẠO NHÂN VẬT MỚI
function createNewCharacter(name, password) {
  const randomElement = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  const starterPhysique = PHYSIQUES[0]; // Phàm thai nhục thân

  // Khởi tạo 8 ô đất cho mỗi loại vườn (stage: 0..4)
  const createPlots = () => {
    let plots = [];
    for (let i = 0; i < 8; i++) {
      plots.push({
        id: i,
        stage: Math.floor(Math.random() * 4), // 0..3
        water: Math.floor(Math.random() * 5), // 0..4
        fert: Math.floor(Math.random() * 6),  // 0..5
        hasBug: Math.random() < 0.3
      });
    }
    return plots;
  };

  return {
    name: name.trim(),
    password: password || "123456",
    element: randomElement,
    realmId: 1, // Luyện Khí Tầng 1
    exp: 0,
    currentHp: 500,
    stamina: 100,
    maxStamina: 100,
    spiritStones: 5000,
    physique: starterPhysique.name,
    physiquePending: null,
    hasCuLinhTran: false,
    wellCooldownUntil: 0,
    inventory: {
      "thao_duoc_linh_chi": 25,
      "thao_duoc_hoang_tinh": 20,
      "dan_the_luc": 5,
      "dan_hoi_mau": 5
    },
    gardens: {
      "DAN": createPlots(),
      "HOA": createPlots(),
      "HIEM": createPlots()
    },
    createdAt: Date.now(),
    lastActiveAt: Date.now()
  };
}

module.exports = {
  REALMS,
  PHYSIQUES,
  ELEMENTS,
  MONSTERS,
  rollPhysique,
  simulateCombat,
  getCalculatedStats,
  createNewCharacter
};
