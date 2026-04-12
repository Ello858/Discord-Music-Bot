const { SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { playlistCollection } = require('../../mongodb.js');
const { getEmoji } = require('../../UI/emojis/emoji');
const { sendErrorResponse, handleCommandError, safeDeferReply, safeDeferUpdate, buildPaleCard, sanitizeTitle } = require('../../utils/responseHandler.js');
const { getLang } = require('../../utils/languageLoader.js');

const PAGE_SIZE = 8;
const MAX_PAGE_TEXT = 3200;

function buildPlaylistPage(playlists, pageIndex, lang) {
    const start = pageIndex * PAGE_SIZE;
    const pageItems = playlists.slice(start, start + PAGE_SIZE);

    const lines = [];
    for (let idx = 0; idx < pageItems.length; idx++) {
        const playlist = pageItems[idx];
        const line = lang.playlist.allplaylists.playlistItem
            .replace('{number}', start + idx + 1)
            .replace('{name}', playlist.name)
            .replace('{creator}', `<@${playlist.userId}>`)
            .replace('{server}', playlist.serverName)
            .replace('{count}', playlist.songs.length);

        if ((lines.join('\n\n').length + line.length) > MAX_PAGE_TEXT) break;
        lines.push(line);
    }

    const totalPages = Math.max(1, Math.ceil(playlists.length / PAGE_SIZE));
    const title = lang.playlist.allplaylists.title
        .replace('{currentPage}', pageIndex + 1)
        .replace('{totalPages}', totalPages);

    return buildPaleCard(
        `${getEmoji('playlist')} ${sanitizeTitle(title, 'Public Playlists')}`,
        [`### ${getEmoji('folder')} Playlists\n${lines.join('\n\n') || 'No playlists on this page.'}`]
    );
}

function buildPagerRow(pageIndex, totalPages) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('allplaylists_prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex <= 0),
        new ButtonBuilder()
            .setCustomId('allplaylists_next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pageIndex >= totalPages - 1)
    );
}

const data = new SlashCommandBuilder()
  .setName("allplaylists")
  .setDescription("List all public playlists");

module.exports = {
    data: data,
    run: async (client, interaction) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);

            const playlists = await playlistCollection.find({ isPrivate: false }).toArray();

            if (!playlists.length) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.allplaylists.noPlaylists.title}\n\n` +
                    `${lang.playlist.allplaylists.noPlaylists.message}\n` +
                    `${lang.playlist.allplaylists.noPlaylists.note}`,
                    5000
                );
            }

            const totalPages = Math.max(1, Math.ceil(playlists.length / PAGE_SIZE));
            let currentPage = 0;

            const renderComponents = () => {
                const pageCard = buildPlaylistPage(playlists, currentPage, lang);
                return [pageCard, buildPagerRow(currentPage, totalPages)];
            };

            const reply = await interaction.editReply({
                components: renderComponents(),
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });

            const collector = reply.createMessageComponentCollector({
                time: 30000,
                filter: (i) => i.user.id === interaction.user.id && (i.customId === 'allplaylists_prev' || i.customId === 'allplaylists_next')
            });

            collector.on('collect', async (i) => {
                const deferred = await safeDeferUpdate(i);
                if (!deferred && !i.deferred && !i.replied) return;

                if (i.customId === 'allplaylists_prev') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (i.customId === 'allplaylists_next') {
                    currentPage = Math.min(totalPages - 1, currentPage + 1);
                }

                await interaction.editReply({
                    components: renderComponents(),
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => {});
            });

            collector.on('end', async () => {
                await interaction.editReply({
                    components: [buildPlaylistPage(playlists, currentPage, lang)],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => {});
            });

            setTimeout(() => reply.delete().catch(() => {}), 30000);
            return reply;

        } catch (error) {
            const lang = await getLang(interaction.guildId);
            return handleCommandError(
                interaction,
                error,
                'allplaylists',
                `${lang.playlist.allplaylists.errors.title}\n\n` +
                `${lang.playlist.allplaylists.errors.message}`
            );
        }
    }
};
