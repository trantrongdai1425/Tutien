// discord-bot/config.js - Cấu hình giao diện và thông số Discord Bot
require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  geminiApiKey: process.env.GEMINI_API_KEY,

  // Bảng màu chuẩn Cổ Phong Dark Daoist
  colors: {
    primary: 0xd4af37,    // Hoàng kim cổ phong (#D4AF37)
    cyan: 0x38bdf8,       // Linh khí lam sắc (#38BDF8)
    purple: 0xa855f7,     // Thần thức huyền ảo (#A855F7)
    red: 0xef4444,        // Huyết sát chiến đấu (#EF4444)
    green: 0x22c55e,      // Sinh mệnh dược đạo (#22C55E)
    dark: 0x0f172a        // Huyền u đêm tối (#0F172A)
  },

  // Bộ biểu tượng Tiên Hiệp
  emojis: {
    realm: "⚡",
    exp: "📈",
    hp: "❤️",
    atk: "⚔️",
    def: "🛡️",
    speed: "💨",
    root: "🌿",
    physique: "🧬",
    reservoir: "🏺",
    toxin: "🧪",
    stone: "💎",
    boss: "👹",
    ai: "🔮"
  }
};
