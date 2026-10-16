// discord-bot/embeds/embedBuilder.js - Bộ Xây Dựng Giao Diện Rich Embed Cổ Phong Cho Discord
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

/**
 * 1. BẢNG THÔNG TIN NHÂN VẬT (/tu_vi)
 */
function buildProfileEmbed(char, stats) {
  const percent = Math.min(100, Math.floor((char.exp / stats.maxExp) * 100));
  const barBlocks = Math.floor(percent / 10);
  const progressBar = "█".repeat(barBlocks) + "░".repeat(10 - barBlocks);

  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(`🌌 TU CHÂN GIỚI - BẢN MỆNH TIÊN BẢO`)
    .setDescription(`**Đạo Hiệu:** \`${char.name}\`\n**Chủng Tộc:** ${stats.raceName || char.race || 'Nhân Tộc'}\n**Cảnh Giới:** **${stats.realmName || 'Luyện Khí'}**`)
    .addFields(
      {
        name: `📈 Tu Vi Tiến Độ [${percent}%]`,
        value: `\`${progressBar}\` (${char.exp.toLocaleString()} / ${stats.maxExp.toLocaleString()})\n⚡ **Tốc độ:** +${stats.expPerSec}/giây`,
        inline: false
      },
      {
        name: `⚔️ Thuộc Tính Bản Mệnh`,
        value: `❤️ HP: \`${stats.maxHp.toLocaleString()}\`\n⚔️ ATK: \`${stats.atk.toLocaleString()}\`\n🛡️ DEF: \`${stats.def.toLocaleString()}\`\n💨 Thân Pháp: \`${stats.speed}\``,
        inline: true
      },
      {
        name: `🌿 Tư Chất & Căn Cơ`,
        value: `🌿 Linh Căn: **${stats.spiritualRootName || 'Chân Linh Căn'}**\n🧬 Thể Chất: **${stats.physiqueName || 'Phàm Thể'}**\n🧪 Đan Độc: \`${char.foundation?.pillToxins || 0}%\`\n🏺 Tụ Linh Đỉnh: \`${(char.spiritReservoir?.storedExp || 0).toLocaleString()} EXP\``,
        inline: true
      },
      {
        name: `💰 Tài Nguyên & Bảo Vật`,
        value: `💎 Linh Thạch: \`${(char.spiritStones || 0).toLocaleString()}\`\n🎒 Túi Đồ: \`${char.inventory ? char.inventory.length : 0} vật phẩm\``,
        inline: false
      }
    )
    .setFooter({ text: "Tu Chân Giới • Nhất Niệm Thông Thiên", iconURL: "https://i.imgur.com/8Q5Z2gM.png" })
    .setTimestamp();

  return embed;
}

/**
 * Nút bấm tương tác trên bảng tu vi
 */
function buildProfileButtons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_tuluyen')
      .setLabel('🧘 Vận Công Tu Luyện')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('btn_dotpha')
      .setLabel('⚡ Đột Phá Lôi Kiếp')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_kyngo')
      .setLabel('📜 Tầm Bảo Kỳ Ngộ')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_suton')
      .setLabel('🔮 Sư Tôn Đàm Đạo')
      .setStyle(ButtonStyle.Secondary)
  );
  return row;
}

/**
 * 2. BẢNG KỲ NGỘ ĐỘNG AI (/ky_ngo)
 */
function buildEncounterEmbed(encounter) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.purple)
    .setTitle(`📜 KỲ NGỘ THIÊN DUYÊN: ${encounter.title}`)
    .setDescription(encounter.story)
    .setFooter({ text: "Hãy đưa ra quyết định để định đoạt đạo duyên!" })
    .setTimestamp();

  return embed;
}

function buildEncounterButtons(choices) {
  const row = new ActionRowBuilder();
  choices.forEach((choice, index) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_encounter_${choice.id}`)
        .setLabel(`[${choice.id}] ${choice.text}`)
        .setStyle(index === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );
  });
  return row;
}

/**
 * 3. BẢNG LÔI KIẾP ĐỘ KIẾP (/dot_pha)
 */
function buildTribulationEmbed(char, tribulationLog, success, newRealmName) {
  const embed = new EmbedBuilder()
    .setColor(success ? config.colors.cyan : config.colors.red)
    .setTitle(success ? `⚡ ĐỘ KIẾP THÀNH CÔNG: PHI THĂNG ${newRealmName}!` : `⛈️ ĐỘ KIẾP THẤT BẠI: LÔI ĐÌNH TRẢM THỂ!`)
    .setDescription(tribulationLog)
    .setFooter({ text: success ? "Chúc mừng đạo hữu đăng phong tạo cực!" : "Căn cơ tổn hại, hãy bồi đắp lại trước khi thử lại." })
    .setTimestamp();

  return embed;
}

module.exports = {
  buildProfileEmbed,
  buildProfileButtons,
  buildEncounterEmbed,
  buildEncounterButtons,
  buildTribulationEmbed
};
