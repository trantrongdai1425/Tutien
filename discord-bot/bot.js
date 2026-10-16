// discord-bot/bot.js - Entry Point Máy Chủ Discord Bot Tu Chân Giới
const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, ChannelType } = require('discord.js');
const config = require('./config');
const { readDb, saveDb } = require('../server/db');
const { getCalculatedStats, ensureCharacterSchema, simulateTribulation, REALMS } = require('../server/gameEngine');
const { chatWithMaster, generateRandomEncounter } = require('./services/aiService');
const { buildTribulationEmbed, buildEncounterEmbed, buildEncounterButtons } = require('./embeds/embedBuilder');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Nạp danh sách Slash Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

// 1. SỰ KIỆN KHI BOT SẴN SÀNG
client.once(Events.ClientReady, readyClient => {
  console.log(`🌌 [TU CHÂN GIỚI BOT] Đã đăng nhập thành công với danh xưng: ${readyClient.user.tag}`);
  console.log(`⚡ Sẵn sàng tiếp nhận thần thức của các vị đạo hữu!`);
});

// 2. XỬ LÝ LỆNH SLASH & NÚT BẤM TƯƠNG TÁC
client.on(Events.InteractionCreate, async interaction => {
  // A. XỬ LÝ LỆNH SLASH COMMAND
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Lỗi thực thi lệnh ${interaction.commandName}:`, error);
      const replyObj = { content: '❌ Thiên đạo xuất hiện dị biến khi thi triển pháp quyết!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyObj);
      } else {
        await interaction.reply(replyObj);
      }
    }
    return;
  }

  // B. XỬ LÝ NÚT BẤM TƯƠNG TÁC (BUTTONS)
  if (interaction.isButton()) {
    const customId = interaction.customId;
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
        content: `❌ Bạn chưa liên kết nhân vật! Dùng lệnh \`/nhap_mon\` hoặc \`/lien_ket\` trước.`,
        ephemeral: true
      });
    }

    ensureCharacterSchema(char);
    const stats = getCalculatedStats(char);

    // Nút: Vận Công Tu Luyện
    if (customId === 'btn_tuluyen') {
      const gainExp = Math.max(10, Math.floor(stats.expPerSec * 30));
      char.exp = Math.min(stats.maxExp, char.exp + gainExp);
      saveDb(db);
      return interaction.reply({
        content: `🧘 **[VẬN CÔNG HOÀN TẤT]**\nĐạo hữu hấp thu linh khí, tu vi tăng thêm \`+${gainExp.toLocaleString()}\`! Tiến độ: \`${char.exp.toLocaleString()} / ${stats.maxExp.toLocaleString()} EXP\`.`,
        ephemeral: true
      });
    }

    // Nút: Đột Phá Lôi Kiếp
    if (customId === 'btn_dotpha') {
      if (char.exp < stats.maxExp) {
        return interaction.reply({
          content: `⏳ Tu vi chưa đầy (\`${char.exp.toLocaleString()} / ${stats.maxExp.toLocaleString()}\`), chưa thể dẫn động lôi kiếp!`,
          ephemeral: true
        });
      }

      await interaction.deferReply();
      const tribResult = simulateTribulation(char, false);
      if (tribResult.success) {
        char.realmId++;
        char.exp = 0;
        saveDb(db);
        const newRealm = REALMS.find(r => r.id === char.realmId) || { name: `Cấp ${char.realmId}` };
        const embed = buildTribulationEmbed(char, tribResult.log || "Đạo tâm kiên định, phá kén hóa bướm!", true, newRealm.name);
        return interaction.editReply({ embeds: [embed] });
      } else {
        saveDb(db);
        const embed = buildTribulationEmbed(char, tribResult.log || "Thiên lôi oanh kích, độ kiếp thất bại!", false, stats.realmName);
        return interaction.editReply({ embeds: [embed] });
      }
    }

    // Nút: Tầm Bảo Kỳ Ngộ
    if (customId === 'btn_kyngo') {
      await interaction.deferReply();
      char.realmName = stats.realmName;
      const encounter = await generateRandomEncounter(char);
      const embed = buildEncounterEmbed(encounter);
      const buttons = buildEncounterButtons(encounter.choices);
      return interaction.editReply({ embeds: [embed], components: [buttons] });
    }

    // Nút: Lựa chọn trong kỳ ngộ (A, B, C)
    if (customId.startsWith('btn_encounter_')) {
      const choiceId = customId.replace('btn_encounter_', '');
      const rewardExp = Math.floor(stats.expPerSec * 60);
      const rewardStones = Math.floor(Math.random() * 200) + 50;

      char.exp = Math.min(stats.maxExp, char.exp + rewardExp);
      char.spiritStones = (char.spiritStones || 0) + rewardStones;
      saveDb(db);

      return interaction.reply({
        content: `✨ **[KẾT QUẢ KỲ NGỘ - LỰA CHỌN ${choiceId}]**\nNgươi hành động quyết đoán, cơ duyên hiển lộ: Nhận được \`+${rewardExp.toLocaleString()} Tu Vi\` và \`+${rewardStones} Linh Thạch\`!`,
        ephemeral: false
      });
    }

    // Nút: Sư Tôn Đàm Đạo
    if (customId === 'btn_suton') {
      await interaction.deferReply({ ephemeral: true });
      char.realmName = stats.realmName;
      const reply = await chatWithMaster(char, "Đệ tử cầu kiến Sư Tôn, xin người truyền dạy đôi lời!");
      return interaction.editReply({
        content: `🔮 **[KHÍ LINH SƯ TÔN PHÁN TRUYỀN]**\n${reply}\n\n*(Dùng lệnh \`/su_ton\` để mở Thread chat trực tiếp)*`
      });
    }
  }
});

// 3. TỰ ĐỘNG CHAT AI TRONG THREAD "VẤN ĐẠO"
client.on(Events.MessageCreate, async message => {
  // Bỏ qua tin nhắn từ bot hoặc không phải trong Thread
  if (message.author.bot) return;
  if (!message.channel.isThread()) return;

  // Kiểm tra tên Thread có định dạng đàm đạo vấn đạo
  if (message.channel.name.startsWith('🔮-vấn-đạo-')) {
    const db = readDb();
    let char = null;
    for (const key in db.characters) {
      if (db.characters[key].discordId === message.author.id) {
        char = db.characters[key];
        break;
      }
    }

    if (!char) return;

    ensureCharacterSchema(char);
    const stats = getCalculatedStats(char);
    char.realmName = stats.realmName;

    await message.channel.sendTyping();
    const aiResponse = await chatWithMaster(char, message.content);
    return message.reply({ content: aiResponse });
  }
});

// Khởi chạy Bot nếu có TOKEN
if (config.token && config.token !== 'your_bot_token_here') {
  client.login(config.token).catch(err => {
    console.error("❌ Không thể đăng nhập Discord Bot:", err.message);
  });
} else {
  console.log("ℹ️ [DISCORD BOT] Chưa cấu hình DISCORD_TOKEN trong file discord-bot/.env. Vui lòng cấu hình token để kết nối với Discord!");
}

module.exports = client;
