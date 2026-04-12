const config = require("../../config");
const { EMOJIS, REDWHITE_CUSTOMS } = require("./emojiData");

function useCustomEmoji() {
    return config.customEmoji === true;
}

function getTheme() {
    return String(config.emojiTheme || "redwhite").toLowerCase();
}

function parseRawCustomEmoji(raw) {
    if (typeof raw !== "string") return null;
    const match = raw.trim().match(/^<a?:(\w+):(\d+)>$/);
    if (!match) return null;

    return {
        name: match[1],
        id: match[2]
    };
}

function resolveCustomEntry(entry) {
    if (!entry) return null;

    if (typeof entry.custom === "string" && entry.custom.trim()) {
        return { raw: entry.custom.trim() };
    }

    if (entry.custom && typeof entry.custom === "object") {
        const themed = entry.custom[getTheme()] || entry.custom.default;
        if (typeof themed === "string" && themed.trim()) {
            return { raw: themed.trim() };
        }

        if (themed && themed.name && themed.id) {
            return { name: themed.name, id: themed.id, animated: Boolean(themed.animated) };
        }
    }

    // Backward compatibility for old structure.
    if (entry.customName && entry.customId) {
        return { name: entry.customName, id: entry.customId };
    }

    return null;
}

function buildCustomEmoji(entry) {
    const custom = resolveCustomEntry(entry);
    if (!custom) return null;

    if (custom.raw) return custom.raw;
    if (custom.name && custom.id) {
        const prefix = custom.animated ? "<a:" : "<:";
        return `${prefix}${custom.name}:${custom.id}>`;
    }

    return null;
}

function getEmoji(key) {
    const entry = EMOJIS[key];
    if (!entry) return "";

    if (useCustomEmoji()) {
        const custom = buildCustomEmoji(entry);
        if (custom) return custom;
    }

    return entry.default || "";
}

function getButtonEmoji(key) {
    const entry = EMOJIS[key];
    if (!entry) return null;

    if (useCustomEmoji()) {
        const custom = resolveCustomEntry(entry);
        if (custom?.name && custom?.id) {
            return {
                name: custom.name,
                id: custom.id,
                animated: Boolean(custom.animated)
            };
        }

        if (custom?.raw) {
            const parsed = parseRawCustomEmoji(custom.raw);
            if (parsed) return parsed;
        }
    }

    return entry.default || null;
}

module.exports = {
    EMOJIS,
    REDWHITE_CUSTOMS,
    getEmoji,
    getButtonEmoji
};
