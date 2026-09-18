const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');

// Dữ liệu mẫu ban đầu nếu file database.json chưa có
const DEFAULT_DATA = {
  characters: {}, // key: name.toLowerCase()
  worldBoss: {
    id: "boss_tram_lu",
    name: "Trạm Lư Ma Tôn (Thái Cổ Hung Thú)",
    currentHp: 5000000,
    maxHp: 5000000,
    atk: 1500,
    def: 800,
    isAlive: true,
    lastKilledAt: null,
    respawnAt: null,
    dpsTable: {} // key: charName -> totalDamage
  },
  parties: {}, // key: partyId -> { id, leader, dungeonKey, difficulty, members: [], status: 'WAITING'|'RUNNING', stage: 1, logs: [] }
  chatMessages: [
    {
      id: "sys_1",
      sender: "Hệ Thống",
      realm: "Thiên Đạo",
      text: "Chào mừng các vị đạo hữu giá lâm Tu Chân Giới!",
      time: new Date().toLocaleTimeString()
    }
  ]
};

// Đảm bảo thư mục data tồn tại
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Đọc dữ liệu từ file
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveDb(DEFAULT_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Lỗi đọc database.json, dùng fallback mặc định:", err.message);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

// Lưu dữ liệu vào file
function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Lỗi lưu database.json:", err.message);
  }
}

module.exports = {
  readDb,
  saveDb,
  DB_FILE
};
