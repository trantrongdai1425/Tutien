// discord-bot/commands/tuvi.js - Lệnh tra cứu thông tin nhân vật và bảng điều khiển tu luyện
const { SlashCommandBuilder } = require('discord.js');
const { readDb } = require('../../server/db');
const { getCalculatedStats, ensureCharacterSchema } = require('../../server/gameEngine');
const { buildProfileEmbed, buildProfileButtons } = require('../embeds/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tu_vi')
    .setDescription('Xem bảng thông số Bản Mệnh Tiên Bảo và trạng thái tu vi'),

  async execute(interaction) {
    const discordId = interaction.user.id;
    const db = readDb();

    // Tìm nhân vật theo Discord ID
    let char = null;
    for (const key in db.characters) {
      if (db.characters[key].discordId === discordId) {
        char = db.characters[key];
        break;
      }
    }

    if (!char) {
      return interaction.reply({
        content: `❌ Bạn chưa gia nhập Tu Chân Giới!\n- Nếu đã có nhân vật trên Web: Dùng lệnh \`/lien_ket <tên_nhân_vật>\`\n- Nếu là tân thủ: Dùng lệnh \`/nhap_mon <đạo_hiệu>\` để khai sơn lập đạo!`,
        ephemeral: true
      });
    }

    ensureCharacterSchema(char);
    const stats = getCalculatedStats(char);

    const embed = buildProfileEmbed(char, stats);
    const buttons = buildProfileButtons();

    return interaction.reply({
      embeds: [embed],
      components: [buttons]
    });
  }
};
