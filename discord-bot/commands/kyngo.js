// discord-bot/commands/kyngo.js - Lệnh kỳ ngộ thám hiểm bát hoang bằng AI
const { SlashCommandBuilder } = require('discord.js');
const { readDb } = require('../../server/db');
const { ensureCharacterSchema, getCalculatedStats } = require('../../server/gameEngine');
const { generateRandomEncounter } = require('../services/aiService');
const { buildEncounterEmbed, buildEncounterButtons } = require('../embeds/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ky_ngo')
    .setDescription('Tầm bảo bát hoang: Kích hoạt sự kiện kỳ ngộ ngẫu nhiên do AI sinh ra'),

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

    await interaction.deferReply();

    // Sinh kỳ ngộ bằng AI
    const encounter = await generateRandomEncounter(char);

    const embed = buildEncounterEmbed(encounter);
    const buttons = buildEncounterButtons(encounter.choices);

    return interaction.editReply({
      embeds: [embed],
      components: [buttons]
    });
  }
};
