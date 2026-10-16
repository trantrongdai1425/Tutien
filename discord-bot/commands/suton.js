// discord-bot/commands/suton.js - Lệnh mở Thread đàm đạo với Sư Tôn / Khí Linh AI
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { readDb } = require('../../server/db');
const { ensureCharacterSchema, getCalculatedStats } = require('../../server/gameEngine');
const { chatWithMaster } = require('../services/aiService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('su_ton')
    .setDescription('Mở Thần Thức Thread để đàm đạo riêng với Sư Tôn / Khí Linh Bản Mệnh'),

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
    char.realmName = stats.realmName;

    // Kiểm tra channel có hỗ trợ tạo Thread không
    if (!interaction.channel || !interaction.channel.threads) {
      // Nếu không tạo được thread (ví dụ trong DM), trả lời trực tiếp
      await interaction.deferReply();
      const reply = await chatWithMaster(char, "Đệ tử kính cẩn thỉnh an Sư Tôn! Xin người chỉ điểm vài lời.");
      return interaction.editReply({
        content: `🔮 **[KHÍ LINH SƯ TÔN GIÁ LÂM]**\n${reply}`
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Tạo Thread riêng biệt cho người chơi
      const thread = await interaction.channel.threads.create({
        name: `🔮-vấn-đạo-${char.name}`,
        autoArchiveDuration: 60,
        type: ChannelType.PrivateThread,
        reason: 'Đàm đạo vấn đạo tu tiên cùng AI Sư Tôn'
      });

      // Thêm người chơi vào thread
      await thread.members.add(interaction.user.id);

      // AI chào đón
      const initialGreeting = await chatWithMaster(char, "Đệ tử vừa thỉnh an và mở thần thức kết nối!");

      await thread.send({
        content: `🌌 **[THẦN THỨC CÂU THÔNG KHÍ LINH SƯ TÔN]**\n*Sư Tôn đã ngự giá tại thread này. Ngươi có thể gõ bất kỳ câu hỏi nào về công pháp, đan dược, lôi kiếp, hoặc tâm ma để đàm đạo!*\n\n${initialGreeting}`
      });

      return interaction.editReply({
        content: `✨ Đã mở Thần Thức Không Gian tại ${thread.toString()}! Mời đạo hữu tiến vào đàm đạo cùng Sư Tôn.`
      });
    } catch (err) {
      // Fallback nếu không đủ quyền tạo Private Thread
      const reply = await chatWithMaster(char, "Đệ tử thỉnh an Sư Tôn!");
      return interaction.editReply({
        content: `🔮 **[KHÍ LINH SƯ TÔN]**\n${reply}\n*(Gợi ý: Cấp quyền Manage Threads cho Bot để tự động mở Thread riêng tư)*`
      });
    }
  }
};
