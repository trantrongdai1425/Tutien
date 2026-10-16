// discord-bot/commands/tuluyen.js - Lệnh vận công tu luyện thủ công
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDb, saveDb } = require('../../server/db');
const { getCalculatedStats, ensureCharacterSchema } = require('../../server/gameEngine');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tu_luyen')
    .setDescription('Tĩnh tọa vận công một chu thiên, thu nạp linh khí thiên địa'),

  async execute(interaction) {
    const discordId = interaction.user.id;
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

    // Tính lượng tu vi nhận được từ 1 chu thiên (tương đương 30 giây bế quan tập trung)
    const gainExp = Math.max(10, Math.floor(stats.expPerSec * 30));
    const oldExp = char.exp;
    char.exp = Math.min(stats.maxExp, char.exp + gainExp);
    const actualGain = char.exp - oldExp;

    // Nếu đã đầy tu vi: nạp vào Tụ Linh Đỉnh
    let reservoirMsg = "";
    if (actualGain < gainExp) {
      const overflow = (gainExp - actualGain) * 0.4;
      const maxCap = char.spiritReservoir.maxCapacity || (stats.maxExp * 2);
      char.spiritReservoir.storedExp = Math.min(maxCap, (char.spiritReservoir.storedExp || 0) + overflow);
      reservoirMsg = `\n🏺 Tu vi dôi dư \`+${Math.floor(overflow)}\` đã được chuyển vào **Tụ Linh Đỉnh**!`;
    }

    saveDb(db);

    const embed = new EmbedBuilder()
      .setColor(config.colors.cyan)
      .setTitle(`🧘 THIỀN ĐỊNH VẬN CHUYỂN CHU THIÊN`)
      .setDescription(`Đạo hữu nhập định tĩnh tâm, dẫn dắt linh khí đất trời tuần hoàn qua thập nhị kinh mạch!`)
      .addFields(
        { name: `📈 Tu Vi Thu Được`, value: `\`+${actualGain.toLocaleString()} EXP\``, inline: true },
        { name: `⚡ Tiến Độ Hiện Tại`, value: `\`${char.exp.toLocaleString()} / ${stats.maxExp.toLocaleString()} EXP\` (${Math.min(100, Math.floor((char.exp / stats.maxExp) * 100))}%)`, inline: true }
      )
      .setFooter({ text: char.exp >= stats.maxExp ? "Tu vi đã viên mãn, hãy mau dùng /dot_pha để dẫn động lôi kiếp!" : "Hãy tiếp tục tích lũy tu vi!" })
      .setTimestamp();

    if (reservoirMsg) {
      embed.addFields({ name: `🏺 Tụ Linh Đỉnh`, value: reservoirMsg, inline: false });
    }

    return interaction.reply({ embeds: [embed] });
  }
};
