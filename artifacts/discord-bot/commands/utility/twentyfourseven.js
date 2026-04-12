const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getEmoji } = require('../../UI/emojis/emoji');
const { autoplayCollection } = require('../../mongodb.js');
const { getLang } = require('../../utils/languageLoader.js');
const { handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } = require('../../utils/responseHandler.js');

const data = new SlashCommandBuilder()
  .setName("247")
  .setDescription("Toggle 24/7 mode (keep bot in voice channel)")
  .addBooleanOption(option =>
    option.setName("enable")
      .setDescription("Enable or disable 24/7 mode")
      .setRequired(true)
  );

module.exports = {
    data: data,
    run: async (client, interaction) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);

            if (interaction.guild.ownerId !== interaction.user.id) {
                const errorContainer = buildPaleCard(
                    `${getEmoji('error')} ${sanitizeTitle(lang.utility.twentyfourseven.accessDenied.title, 'Access Denied')}`,
                    [lang.utility.twentyfourseven.accessDenied.message]
                );

                const reply = await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return reply;
            }

            const enable = interaction.options.getBoolean('enable');
            const guildId = interaction.guild.id;

            await autoplayCollection.updateOne(
                { guildId },
                { $set: { twentyfourseven: enable } },
                { upsert: true }
            );

            const statusText = enable 
                ? `${lang.utility.twentyfourseven.enabled.title}\n\n${lang.utility.twentyfourseven.enabled.message}\n\n${lang.utility.twentyfourseven.enabled.note}`
                : `${lang.utility.twentyfourseven.disabled.title}\n\n${lang.utility.twentyfourseven.disabled.message}\n\n${lang.utility.twentyfourseven.disabled.note}`;

            const statusContainer = buildPaleCard(
                `${enable ? getEmoji('success') : getEmoji('warning')} ${sanitizeTitle(enable ? lang.utility.twentyfourseven.enabled.title : lang.utility.twentyfourseven.disabled.title, '24/7 Mode')}`,
                [
                    enable ? lang.utility.twentyfourseven.enabled.message : lang.utility.twentyfourseven.disabled.message,
                    enable ? lang.utility.twentyfourseven.enabled.note : lang.utility.twentyfourseven.disabled.note
                ]
            );

            const reply = await interaction.editReply({
                components: [statusContainer],
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
            return reply;

        } catch (error) {
            return handleCommandError(
                interaction,
                error,
                '247',
                null
            );
        }
    }
};
