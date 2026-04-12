const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { REDWHITE_CUSTOMS } = require('../../UI/emojis/emojiData');

const data = new SlashCommandBuilder()
  .setName('emoji')
  .setDescription('Export emoji IDs for the bot theme map')
  .addBooleanOption((option) =>
    option
      .setName('all')
      .setDescription('Include all server emojis in the export output')
      .setRequired(false)
  );

function buildRequiredExport(guildEmojis) {
  const lines = [];
  const missing = [];
  let matchedCount = 0;

  for (const [key, spec] of Object.entries(REDWHITE_CUSTOMS)) {
    const emoji = guildEmojis.find((e) => e.name === spec.name);
    const id = emoji?.id || '';

    if (id) matchedCount += 1;
    else missing.push(spec.name);

    lines.push(`    ${key}: { name: "${spec.name}", id: "${id}" },`);
  }

  const exportBlock = [
    'const REDWHITE_CUSTOMS = Object.freeze({',
    ...lines,
    '});'
  ].join('\n');

  return {
    exportBlock,
    missing,
    matchedCount,
    total: Object.keys(REDWHITE_CUSTOMS).length
  };
}

function buildAllEmojiList(guildEmojis) {
  return [...guildEmojis.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((emoji) => `${emoji.name}: ${emoji.id}`)
    .join('\n');
}

async function sendExport(interaction, content) {
  if (content.length <= 1800) {
    return interaction.editReply({ content });
  }

  const file = new AttachmentBuilder(Buffer.from(content, 'utf8'), {
    name: 'emoji-export.txt'
  });

  return interaction.editReply({
    content: 'Export is large, sent as file: emoji-export.txt',
    files: [file]
  });
}

module.exports = {
  data,
  run: async (_client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild) {
      return interaction.editReply({ content: 'This command can only be used in a server.' });
    }

    const includeAll = interaction.options.getBoolean('all') || false;
    const guildEmojis = await interaction.guild.emojis.fetch();
    const required = buildRequiredExport(guildEmojis);

    const missingText = required.missing.length
      ? required.missing.join(', ')
      : 'None';

    const sections = [
      `Emoji export completed`,
      `Matched: ${required.matchedCount}/${required.total}`,
      `Missing: ${missingText}`,
      '',
      'Paste this into UI/emojis/emojiData.js:',
      '```js',
      required.exportBlock,
      '```'
    ];

    if (includeAll) {
      sections.push('');
      sections.push('All server emojis:');
      sections.push('```txt');
      sections.push(buildAllEmojiList(guildEmojis));
      sections.push('```');
    }

    return sendExport(interaction, sections.join('\n'));
  }
};
