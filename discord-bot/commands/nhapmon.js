// discord-bot/commands/nhapmon.js - Lệnh khởi tạo nhân vật trực tiếp trên Discord
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDb, saveDb } = require('../../server/db');
const { createNewCharacter, ensureCharacterSchema, getCalculatedStats } = require('../../server/gameEngine');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nhap_mon')
    .setDescription('Khai sơn lập đạo: Khởi tạo nhân vật mới trực tiếp trên Discord')
    .addStringOption(option =>
      option.setName('dao_hieu')
        .setDescription('Đạo hiệu tu tiên của bạn (Ví dụ: Tiêu Dao Tử, Dạ Ma Vương)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('chung_toc')
        .setDescription('Chọn chủng tộc khởi đầu')
        .setRequired(false)
        .addChoices(
          { name: '🧑 Nhân Tộc (Cân bằng, giác ngộ cao)', value: 'Nhan' },
          { name: '✨ Tiên Tộc (Linh khí thuần khiết, phi thăng nhanh)', value: 'Tien' },
          { name: '⚔️ Ma Tộc (Cuồng ma khát máu, sát phạt mãnh liệt)', value: 'Ma' },
          { name: '🐉 Yêu Tộc (Thái cổ thần khu, máu trâu thủ dày)', value: 'Yeu' },
          { name: '👻 Minh Tộc (U hồn bất diệt, bạo kích chí mạng)', value: 'Minh' }
        )
    )
    .addStringOption(option =>
      option.setName('mat_khau')
        .setDescription('Mật khẩu để đăng nhập trên Web Game (Mặc định: 123456)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const name = interaction.options.getString('dao_hieu').trim();
    const race = interaction.options.getString('chung_toc') || 'Nhan';
    const password = interaction.options.getString('mat_khau') || '123456';
    const discordId = interaction.user.id;

    const db = readDb();
    const key = name.toLowerCase();

    // Kiểm tra tên đã tồn tại chưa
    if (db.characters && db.characters[key]) {
      return interaction.reply({
        content: `❌ Đạo hiệu **${name}** đã có người sử dụng trong Tu Chân Giới! Nếu đó là nhân vật của bạn, hãy dùng lệnh \`/lien_ket ${name}\`.`,
        ephemeral: true
      });
    }

    // Kiểm tra xem Discord ID này đã liên kết nhân vật nào chưa
    for (const k in db.characters) {
      if (db.characters[k].discordId === discordId) {
        return interaction.reply({
          content: `⚠️ Tài khoản Discord của bạn đã gắn liền với nhân vật **${db.characters[k].name}**! Một đạo hữu chỉ nên tu luyện một bản mệnh chân thân.`,
          ephemeral: true
        });
      }
    }

    // Tạo nhân vật mới
    const newChar = createNewCharacter(name, password, race);
    newChar.discordId = discordId;
    ensureCharacterSchema(newChar);

    if (!db.characters) db.characters = {};
    db.characters[key] = newChar;
    saveDb(db);

    const stats = getCalculatedStats(newChar);

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`🌟 KHAI SƠN LẬP ĐẠO THÀNH CÔNG!`)
      .setDescription(`Chúc mừng **${newChar.name}** đã chính thức bước lên con đường nghịch thiên tu chân!`)
      .addFields(
        { name: `🧬 Chủng Tộc`, value: `${stats.raceName || race}`, inline: true },
        { name: `⚡ Cảnh Giới`, value: `${stats.realmName || 'Luyện Khí Tầng 1'}`, inline: true },
        { name: `🌿 Linh Căn Khởi Nguyên`, value: `${stats.spiritualRootName || 'Chân Linh Căn'}`, inline: false },
        { name: `🩸 Thể Chất Bản Mệnh`, value: `${stats.physiqueName || 'Phàm Thể'}`, inline: true },
        { name: `💎 Linh Thạch Tân Thủ`, value: `${newChar.spiritStones.toLocaleString()} LT`, inline: true },
        { name: `🌐 Đăng Nhập Web`, value: `Bạn có thể dùng tên \`${newChar.name}\` và mật khẩu \`${password}\` để chơi trên nền tảng Web bất cứ lúc nào!`, inline: false }
      )
      .setFooter({ text: "Gõ /tu_vi để bắt đầu hành trình tu tiên!" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
