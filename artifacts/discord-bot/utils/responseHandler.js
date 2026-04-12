const { ContainerBuilder, MessageFlags } = require('discord.js');
const config = require('../config.js');
const { getEmoji } = require('../UI/emojis/emoji');

function stripLeadingIcons(text) {
    return String(text || '')
        .replace(/^\s*<a?:\w+:\d+>\s*/u, '')
        .replace(/^\s*[^\p{L}\p{N}#]+/u, '')
        .trim();
}

function sanitizeTitle(rawTitle, fallback = 'Response') {
    const firstLine = String(rawTitle || '').replace(/\r/g, '').split('\n')[0].trim();
    const clean = stripLeadingIcons(firstLine.replace(/^#{1,6}\s*/, '').trim());
    return clean || fallback;
}

function titleHasIcon(title) {
    const value = String(title || '').trim();
    if (!value) return false;

    return /^(<a?:\w+:\d+>|[\u2190-\u2BFF\u{1F000}-\u{1FAFF}])/u.test(value);
}

function pickTitleIconKey(title, fallbackTitle) {
    const text = `${title || ''} ${fallbackTitle || ''}`.toLowerCase();

    if (/error|failed|invalid|denied|not found|empty/.test(text)) return 'error';
    if (/success|added|created|updated|saved|enabled|disabled|removed|deleted/.test(text)) return 'success';
    if (/queue/.test(text)) return 'queue';
    if (/search|result/.test(text)) return 'search';
    if (/playlist/.test(text)) return 'playlist';
    if (/play|track|music|song|player/.test(text)) return 'music';
    if (/volume|audio|voice/.test(text)) return 'volume';
    if (/support|help/.test(text)) return 'support';
    if (/warn|caution/.test(text)) return 'warning';

    return 'info';
}

function withTitleIcon(title, fallbackTitle = 'Response') {
    const cleanTitle = sanitizeTitle(title, fallbackTitle);
    if (titleHasIcon(cleanTitle)) return cleanTitle;

    const iconKey = pickTitleIconKey(cleanTitle, fallbackTitle);
    const icon = getEmoji(iconKey);
    return icon ? `${icon} ${cleanTitle}` : cleanTitle;
}

function splitMessageSections(message) {
    return String(message || '')
        .replace(/\r/g, '')
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function buildPaleCard(title, sections = []) {
    const container = new ContainerBuilder()
        .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`## ${withTitleIcon(title, 'Response')}`));

    for (const section of sections) {
        container
            .addSeparatorComponents((separator) => separator)
            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(section));
    }

    return container;
}

function cardFromMessage(message, fallbackTitle = 'Response') {
    const sections = splitMessageSections(message);
    if (!sections.length) {
        return buildPaleCard(fallbackTitle, ['No content available.']);
    }

    let title = fallbackTitle;
    let bodySections = sections;

    if (/^#{1,6}\s*/.test(sections[0])) {
        title = sanitizeTitle(sections[0], fallbackTitle);
        bodySections = sections.slice(1);
    }

    return buildPaleCard(title, bodySections.length ? bodySections : [sections[0]]);
}

function isAcknowledgeError(error) {
    const code = error?.code;
    const message = String(error?.message || '').toLowerCase();

    return (
        code === 40060 || // Interaction has already been acknowledged
        code === 10062 || // Unknown interaction
        message.includes('already been acknowledged') ||
        message.includes('unknown interaction')
    );
}

async function safeDeferReply(interaction, options = {}) {
    if (!interaction || interaction.deferred || interaction.replied) {
        return true;
    }

    try {
        await interaction.deferReply(options);
        return true;
    } catch (error) {
        if (isAcknowledgeError(error)) {
            return interaction.deferred || interaction.replied;
        }

        throw error;
    }
}

async function safeDeferUpdate(interaction) {
    if (!interaction || interaction.deferred || interaction.replied) {
        return true;
    }

    try {
        await interaction.deferUpdate();
        return true;
    } catch (error) {
        if (isAcknowledgeError(error)) {
            return interaction.deferred || interaction.replied;
        }

        throw error;
    }
}

function getEmbedColor(color) {
    if (color) {
        return parseInt(color.replace('#', ''), 16);
    }
    return parseInt(config.embedColor?.replace('#', '') || '1db954', 16);
}

function scheduleReplyDeletion(interaction, reply, deleteAfter) {
    if (!(deleteAfter > 0)) return;

    setTimeout(async () => {
        try {
            if (interaction && (interaction.deferred || interaction.replied)) {
                await interaction.deleteReply();
                return;
            }
        } catch (_) {
            // Fall back to direct message deletion.
        }

        try {
            await reply?.delete?.();
        } catch (_) {}
    }, deleteAfter);
}

async function sendErrorResponse(interaction, message, deleteAfter = 5000) {
    const errorContainer = cardFromMessage(message, 'Error');

    let reply;
    if (interaction.deferred || interaction.replied) {
        reply = await interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2,
            fetchReply: true
        });
    } else {
        reply = await interaction.reply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            fetchReply: true
        });
    }
    
    scheduleReplyDeletion(interaction, reply, deleteAfter);
    
    return reply;
}

async function sendSuccessResponse(interaction, message, color = null, deleteAfter = 3000) {
    const successContainer = cardFromMessage(message, 'Success');

    let reply;
    if (interaction.deferred || interaction.replied) {
        reply = await interaction.editReply({
            components: [successContainer],
            flags: MessageFlags.IsComponentsV2,
            fetchReply: true
        });
    } else {
        reply = await interaction.reply({
            components: [successContainer],
            flags: MessageFlags.IsComponentsV2,
            fetchReply: true
        });
    }
    
    scheduleReplyDeletion(interaction, reply, deleteAfter);
    
    return reply;
}

async function handleCommandError(interaction, error, commandName, customMessage = null) {
    console.error(`Error processing ${commandName} command:`, error);
    
    const { getLang, getLangSync } = require('./languageLoader.js');

    const lang = await getLang(interaction.guildId).catch(() => {
   
        return getLangSync();
    });
    

    const utils = lang?.utils || {};
    const responseHandler = utils?.responseHandler || {
        defaultError: {
            title: "## ❌ Error",
            message: "An error occurred while processing the command.",
            note: "Please try again later."
        },
        commandError: "❌ An error occurred while processing the {commandName} command."
    };
    
    const errorMessage = customMessage || 
        `${responseHandler.defaultError.title}\n\n` +
        `${responseHandler.defaultError.message}\n` +
        `${responseHandler.defaultError.note}`;

    const errorContainer = cardFromMessage(errorMessage, 'Error');

    try {
        if (interaction.deferred || interaction.replied) {
            const reply = await interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });
            scheduleReplyDeletion(interaction, reply, 5000);
            return reply;
        } else {
            const reply = await interaction.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                fetchReply: true
            });
            scheduleReplyDeletion(interaction, reply, 5000);
            return reply;
        }
    } catch (e) {
        const errorText = responseHandler.commandError.replace('{commandName}', commandName);
        return interaction.followUp({
            content: errorText,
            flags: MessageFlags.Ephemeral,
        }).catch(() => {});
    }
}

module.exports = {
    getEmbedColor,
    stripLeadingIcons,
    sanitizeTitle,
    withTitleIcon,
    splitMessageSections,
    buildPaleCard,
    cardFromMessage,
    safeDeferReply,
    safeDeferUpdate,
    sendErrorResponse,
    sendSuccessResponse,
    handleCommandError
};
