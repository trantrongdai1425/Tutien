// discord-bot/deploy-commands.js - Script đăng ký Slash Commands lên Discord
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[CẢNH BÁO] Lệnh tại ${filePath} thiếu thuộc tính "data" hoặc "execute"!`);
  }
}

if (!config.token || !config.clientId) {
  console.error("❌ THIẾU CẤU HÌNH: Vui lòng điền DISCORD_TOKEN và CLIENT_ID trong file .env!");
  process.exit(1);
}

const rest = new REST().setToken(config.token);

(async () => {
  try {
    console.log(`⏳ Bắt đầu làm mới ${commands.length} lệnh ứng dụng (/) Tu Chân Giới...`);

    let data;
    if (config.guildId) {
      // Đăng ký cho 1 server cụ thể (Cập nhật tức thì trong 1 giây)
      data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log(`✅ Đã đăng ký thành công ${data.length} Slash Commands cho Guild ID: ${config.guildId}!`);
    } else {
      // Đăng ký toàn cục (Global - có thể mất vài phút để Discord đồng bộ)
      data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      console.log(`✅ Đã đăng ký thành công ${data.length} Slash Commands toàn cầu!`);
    }
  } catch (error) {
    console.error("❌ Lỗi khi đăng ký lệnh:", error);
  }
})();
