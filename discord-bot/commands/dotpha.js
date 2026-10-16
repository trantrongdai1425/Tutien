// discord-bot/commands/dotpha.js - Lệnh độ kiếp lôi phạt vượt cảnh giới
const { SlashCommandBuilder } = require('discord.js');
const { readDb, saveDb } = require('../../server/db');
const { getCalculatedStats, simulateTribulation, REALMS, ensureCharacterSchema } = require('../../server/gameEngine');
const { buildTribulationEmbed } = require('../embeds/embedBuilder');
const { generateTribulationTrial } = require('../services/aiService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dot_pha')
    .setDescription('Dẫn động thiên kiếp, vượt qua lôi phạt để thăng tiến cảnh giới')
    .addBooleanOption(option =>
      option.setName('ho_mach_dan')
        .setDescription('Sử dụng Hộ Mạch Đan để giảm sát thương lôi phạt (nếu có trong túi đồ)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const discordId = interaction.user.id;
    const useShield = interaction.options.getBoolean('ho_mach_dan') || false;

    const db = readDb();
    let char = null;
    for (const key in db.characters) {
      if (db.characters[key].discordId === discordId) {
        char = db.characters[key];
        break;
      }
    }

    if (!char) {
      return interaction.reply({
        content: `❌ Bạn chưa liên kết nhân vật! Gõ \`/nhap_mon\` hoặc \`/lien_ket\` trước.`,
        ephemeral: true
      });
    }

    ensureCharacterSchema(char);
    const stats = getCalculatedStats(char);

    // Kiểm tra tu vi đã đầy chưa
    if (char.exp < stats.maxExp) {
      const remaining = (stats.maxExp - char.exp).toLocaleString();
      return interaction.reply({
        content: `⏳ **CHƯA ĐỦ TU VI ĐỘ KIẾP!**\nĐạo hữu hiện có \`${char.exp.toLocaleString()} / ${stats.maxExp.toLocaleString()}\` tu vi. Còn thiếu \`${remaining}\` tu vi nữa mới có thể câu thông thiên kiếp! Hãy dùng lệnh \`/tu_luyen\` hoặc treo máy thêm.`,
        ephemeral: true
      });
    }

    // Kiểm tra dùng đan dược hộ mạch
    let shieldUsed = false;
    if (useShield) {
      if ((char.inventory && char.inventory["dan_ho_mach"] || 0) >= 1) {
        char.inventory["dan_ho_mach"]--;
        shieldUsed = true;
      } else {
        return interaction.reply({
          content: `⚠️ Túi đồ của đạo hữu không có **Hộ Mạch Đan**! Bạn có thể độ kiếp trần trụi bằng cách không chọn tùy chọn hộ mạch đan.`,
          ephemeral: true
        });
      }
    }

    await interaction.deferReply();

    // Chạy mô phỏng lôi phạt
    const tribResult = simulateTribulation(char, shieldUsed);
    if (tribResult.error) {
      return interaction.editReply({ content: `❌ Lỗi độ kiếp: ${tribResult.error}` });
    }

    let resultMsg = "";
    if (tribResult.success) {
      const oldRealmId = char.realmId;
      char.realmId++;
      char.exp = 0;

      // Phân định Trúc Cơ Đạo Đài
      if (oldRealmId === 9 && char.realmId === 10) {
        const stability = (char.foundation && char.foundation.stability) || 100;
        const toxins = (char.foundation && char.foundation.pillToxins) || 0;
        if (stability >= 85 && toxins <= 15) {
          char.foundation.grade = "Thiên Đạo Trúc Cơ";
        } else if (stability >= 60) {
          char.foundation.grade = "Địa Đạo Trúc Cơ";
        } else {
          char.foundation.grade = "Phàm Phẩm Trúc Cơ";
        }
      }

      saveDb(db);
      const newRealm = REALMS.find(r => r.id === char.realmId) || { name: `Cảnh Giới Cấp ${char.realmId}` };

      const embed = buildTribulationEmbed(char, tribResult.log || "Lôi đình chín tầng trời giáng xuống nhưng bị đạo tâm kiên định của ngươi đập tan! Kim đan hiển lộ, khí tức chấn động bát hoang!", true, newRealm.name);
      return interaction.editReply({ embeds: [embed] });
    } else {
      saveDb(db);
      const embed = buildTribulationEmbed(char, tribResult.log || "Thiên lôi quá cuồng bạo, kinh mạch ngươi chấn thương, tu vi bị đánh bật lùi!", false, stats.realmName);
      return interaction.editReply({ embeds: [embed] });
    }
  }
};
