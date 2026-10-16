// discord-bot/commands/lienket.js - Lệnh liên kết tài khoản Discord với nhân vật Web
const { SlashCommandBuilder } = require('discord.js');
const { readDb, saveDb } = require('../../server/db');
const { ensureCharacterSchema } = require('../../server/gameEngine');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lien_ket')
    .setDescription('Liên kết tài khoản Discord với nhân vật Web Game Tu Chân Giới')
    .addStringOption(option =>
      option.setName('ten_nhan_vat')
        .setDescription('Tên nhân vật bạn đã tạo trên Web Game')
        .setRequired(true)
    ),

  async execute(interaction) {
    const charName = interaction.options.getString('ten_nhan_vat').trim();
    const discordId = interaction.user.id;

    const db = readDb();
    const key = charName.toLowerCase();

    if (!db.characters || !db.characters[key]) {
      return interaction.reply({
        content: `❌ Không tìm thấy đạo hữu mang danh hiệu **${charName}** trên Web Game! Vui lòng kiểm tra lại chính xác từng ký tự hoặc tạo mới bằng lệnh \`/nhap_mon\`.`,
        ephemeral: true
      });
    }

    const char = db.characters[key];
    ensureCharacterSchema(char);

    // Gán Discord ID vào nhân vật
    char.discordId = discordId;
    saveDb(db);

    return interaction.reply({
      content: `🎉 **ĐẠO DUYÊN TƯƠNG THÔNG!**\nĐã liên kết thành công tài khoản Discord của bạn với nhân vật **${char.name}**!\nBây giờ bạn có thể gõ lệnh \`/tu_vi\` để kiểm tra bản mệnh tiên bảo!`,
      ephemeral: false
    });
  }
};
