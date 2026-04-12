const { SlashCommandBuilder, ContainerBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const { getLang } = require('../../utils/languageLoader');
const { getEmoji, getButtonEmoji } = require('../../UI/emojis/emoji');
const { safeDeferReply, stripLeadingIcons } = require('../../utils/responseHandler');

const data = new SlashCommandBuilder()
  .setName("support")
  .setDescription("Get support server link and important links");

function buildPaleCard(title, sections, actionRows = []) {
    const container = new ContainerBuilder()
        .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`## ${title}`));

    for (const section of sections) {
        container
            .addSeparatorComponents((separator) => separator)
            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(section));
    }

    if (actionRows.length) {
        container
            .addSeparatorComponents((separator) => separator)
            .addActionRowComponents(actionRows);
    }

    return container;
}

function createLinkButton(label, url, emojiKey) {
    const button = new ButtonBuilder()
        .setLabel(stripLeadingIcons(label))
        .setStyle(ButtonStyle.Link)
        .setURL(url);

    const emoji = getButtonEmoji(emojiKey);
    if (emoji) button.setEmoji(emoji);

    return button;
}

function withExternalHint(linkText) {
    return `${getEmoji('next')} ${linkText}`;
}

module.exports = {
    data: data,
    run: async (client, interaction) => {
        try {
            const lang = await getLang(interaction.guildId);
            const t = lang.support;
            
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;

            const supportServerLink = "https://discord.gg/xQF9f9yUEM";
            const githubLink = "https://github.com/GlaceYT";
            const websiteLink = "https://www.glaceyt.com";
            const youtubeLink = "https://www.youtube.com/@GlaceYT";

            const buttonRow = new ActionRowBuilder().addComponents(
                createLinkButton(t.buttons.supportServer, supportServerLink, 'support'),
                createLinkButton(t.buttons.github, githubLink, 'github'),
                createLinkButton(t.buttons.youtube, youtubeLink, 'play')
            );

            const sections = [
                [
                    t.header.title,
                    t.header.subtitle
                ].join('\n'),
                [
                    t.links.title,
                    '',
                    `${getEmoji('support')} ${t.links.supportServer.title}`,
                    t.links.supportServer.description,
                    withExternalHint(t.links.supportServer.link.replace('{url}', supportServerLink)),
                    '',
                    `${getEmoji('github')} ${t.links.github.title}`,
                    t.links.github.description,
                    withExternalHint(t.links.github.link.replace('{url}', githubLink)),
                    '',
                    `${getEmoji('play')} ${t.links.youtube.title}`,
                    t.links.youtube.description,
                    withExternalHint(t.links.youtube.link.replace('{url}', youtubeLink)),
                    '',
                    `${getEmoji('cloud')} ${t.links.website.title}`,
                    t.links.website.description,
                    withExternalHint(t.links.website.link.replace('{url}', websiteLink))
                ].join('\n'),
                [
                    `${getEmoji('info')} ${t.footer.version}`
                ].join('\n')
            ];

            const card = buildPaleCard(`${getEmoji('support')} Support`, sections, [buttonRow]);

            return interaction.editReply({
                components: [card],
                flags: MessageFlags.IsComponentsV2,
            });

        } catch (e) {
            console.error('Error in support command:', e);
            
            const lang = await getLang(interaction.guildId).catch(() => ({ support: { errors: {} } }));
            const t = lang.support?.errors || {};
            
            const errorCard = buildPaleCard(
                `${getEmoji('error')} Error`,
                [
                    (t.title || '## ❌ Error') + '\n\n' +
                    (t.message || 'An error occurred while fetching support information.\nPlease try again later.')
                ]
            );

            try {
                if (interaction.deferred || interaction.replied) {
                    return interaction.editReply({
                        components: [errorCard],
                        flags: MessageFlags.IsComponentsV2,
                    });
                } else {
                    return interaction.reply({
                        components: [errorCard],
                        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    });
                }
            } catch (replyError) {
                return interaction.followUp({
                    content: t.fallback || "❌ An error occurred while fetching support information.",
                    flags: MessageFlags.Ephemeral,
                }).catch(() => {});
            }
        }
    },
};
