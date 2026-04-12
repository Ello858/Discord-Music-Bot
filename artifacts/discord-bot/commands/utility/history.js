const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { getEmoji, getButtonEmoji } = require('../../UI/emojis/emoji');
const { playlistCollection } = require('../../mongodb.js');
const { getLang } = require('../../utils/languageLoader.js');
const { handleCommandError, safeDeferReply, safeDeferUpdate, buildPaleCard, sanitizeTitle, stripLeadingIcons } = require('../../utils/responseHandler.js');

const data = new SlashCommandBuilder()
  .setName("history")
  .setDescription("Show recently played tracks");

module.exports = {
    data: data,
    run: async (client, interaction) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);

            const guildId = interaction.guildId;

            const historyData = await playlistCollection.findOne({ 
                guildId,
                name: '__HISTORY__'
            });

            if (!historyData || !historyData.songs || historyData.songs.length === 0) {
                const errorContainer = buildPaleCard(
                    `${getEmoji('warning')} ${sanitizeTitle(lang.utility.history.noHistory.title, 'No History')}`,
                    [
                        lang.utility.history.noHistory.message,
                        lang.utility.history.noHistory.note
                    ]
                );

                const reply = await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 30000);
                return reply;
            }

            const songs = historyData.songs.slice().reverse();
            const songsPerPage = 10;
            const totalPages = Math.ceil(songs.length / songsPerPage);
            let currentPage = 1;

            const generateHistoryPage = (page) => {
                const start = (page - 1) * songsPerPage;
                const end = page * songsPerPage;
                const paginatedSongs = songs.slice(start, end);

                return paginatedSongs.map((song, index) => {
                    return `**${start + index + 1}.** [${song}](${song})`;
                }).join('\n') || lang.utility.history.noMoreSongs;
            };

            const historyTitle = totalPages > 1 
                ? lang.utility.history.titlePaginated.replace('{currentPage}', currentPage).replace('{totalPages}', totalPages)
                : lang.utility.history.title;
            const historyContainer = buildPaleCard(
                `${getEmoji('queue')} ${sanitizeTitle(historyTitle, 'History')}`,
                [`### ${getEmoji('music')} Recent Tracks\n${generateHistoryPage(currentPage)}`]
            );

            const footerContainer = buildPaleCard(
                `${getEmoji('info')} Bot`,
                [`**Version 1.5** • Prime Music Bot\nDeveloped by GlaceYT / https://GlaceYT.com`]
            );

            const components = [historyContainer, footerContainer];

            if (totalPages <= 1) {
                const response = await interaction.editReply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2,
                    fetchReply: true
                });
                setTimeout(() => response.delete().catch(() => {}), 30000);
                return response;
            }

            const prevButton = new ButtonBuilder()
                .setCustomId(`history_prev_${interaction.id}`)
                .setLabel(stripLeadingIcons(lang.utility.history.buttons.previous))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 1);
            const prevEmoji = getButtonEmoji('back');
            if (prevEmoji) prevButton.setEmoji(prevEmoji);

            const nextButton = new ButtonBuilder()
                .setCustomId(`history_next_${interaction.id}`)
                .setLabel(stripLeadingIcons(lang.utility.history.buttons.next))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages);
            const nextEmoji = getButtonEmoji('next');
            if (nextEmoji) nextButton.setEmoji(nextEmoji);

            const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

            const response = await interaction.editReply({ 
                components: [...components, row], 
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true 
            });
            setTimeout(() => response.delete().catch(() => {}), 30000);

            const collector = response.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id && (i.customId.startsWith('history_prev_') || i.customId.startsWith('history_next_')),
                time: 60000
            });

            collector.on('collect', async (i) => {
                const deferredUpdate = await safeDeferUpdate(i);
                if (!deferredUpdate && !i.deferred && !i.replied) return;

                if (i.customId.startsWith('history_prev_') && currentPage > 1) {
                    currentPage--;
                } else if (i.customId.startsWith('history_next_') && currentPage < totalPages) {
                    currentPage++;
                }

                const updatedTitle = lang.utility.history.titlePaginated.replace('{currentPage}', currentPage).replace('{totalPages}', totalPages);

                const updatedContainer = buildPaleCard(
                    `${getEmoji('queue')} ${sanitizeTitle(updatedTitle, 'History')}`,
                    [`### ${getEmoji('music')} Recent Tracks\n${generateHistoryPage(currentPage)}`]
                );

                prevButton.setDisabled(currentPage === 1);
                nextButton.setDisabled(currentPage === totalPages);

                await i.editReply({ 
                    components: [updatedContainer, footerContainer, row],
                    flags: MessageFlags.IsComponentsV2,
                });
            });

            collector.on('end', async () => {
                try {
                    await response.edit({ components: components }).catch(() => {});
                } catch (error) {
                }
            });

        } catch (error) {
            return handleCommandError(
                interaction,
                error,
                'history',
                null
            );
        }
    }
};
