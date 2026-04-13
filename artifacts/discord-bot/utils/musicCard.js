const { createCanvas } = require("@napi-rs/canvas");

function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
}

function formatDuration(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return "0:00";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function seededRng(seed) {
    let s = seed >>> 0;
    return function () {
        s = Math.imul(1664525, s) + 1013904223 >>> 0;
        return s / 0x100000000;
    };
}

function getStringSeed(str) {
    let h = 5381;
    const raw = String(str || "default");
    for (let i = 0; i < raw.length; i++) {
        h = Math.imul(33, h) ^ raw.charCodeAt(i);
    }
    return Math.abs(h >>> 0);
}

class EnhancedMusicCard {
    async generateCard(options = {}) {
        const cfg = {
            width: 900,
            height: 260,
            trackURI: options.trackURI || "",
            songTitle: options.songTitle || "Unknown Track",
            songArtist: options.songArtist || "Unknown Artist",
            trackRequester: options.trackRequester || "Unknown",
            currentPositionMs: Number.isFinite(options.currentPositionMs) ? options.currentPositionMs : 0,
            totalDurationMs: Number.isFinite(options.totalDurationMs) ? options.totalDurationMs : 0,
            isPaused: options.isPaused === true,
            loopMode: options.loopMode || "none",
            queueLength: Number.isFinite(options.queueLength) ? options.queueLength : 0,
            sourceName: options.sourceName || "Unknown",
        };

        try {
            const canvas = createCanvas(cfg.width, cfg.height);
            const ctx = canvas.getContext("2d");
            this._draw(ctx, cfg);
            return canvas.toBuffer("image/png");
        } catch (_) {
            return this._errorCard(cfg.width, cfg.height);
        }
    }

    _draw(ctx, cfg) {
        const W = cfg.width;
        const H = cfg.height;
        const PAD = 28;

        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.roundRect(0, 0, W, H, 16);
        ctx.fill();

        const innerLeft = PAD;
        const innerRight = W - PAD;

        let y = 28;

        ctx.font = "600 11px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("NOW PLAYING", innerLeft, y);

        y += 26;

        ctx.font = "600 20px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(this._truncate(ctx, cfg.songTitle, innerRight - innerLeft), innerLeft, y);

        y += 22;

        ctx.font = "400 13px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.50)";
        ctx.fillText(this._truncate(ctx, cfg.songArtist, innerRight - innerLeft), innerLeft, y);

        y += 20;

        this._drawWaveform(ctx, cfg, innerLeft, innerRight, y);
        y += 56;

        this._drawProgress(ctx, cfg, innerLeft, innerRight, y);
        y += 5;

        y += 18;
        const currentText = formatDuration(cfg.currentPositionMs);
        const totalText = cfg.totalDurationMs > 0 ? formatDuration(cfg.totalDurationMs) : "LIVE";
        ctx.font = "400 11px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.40)";
        ctx.textAlign = "left";
        ctx.fillText(currentText, innerLeft, y);
        ctx.textAlign = "right";
        ctx.fillText(totalText, innerRight, y);

        y += 20;

        const loopLabel = cfg.loopMode === "none" ? "Loop off" : cfg.loopMode === "track" ? "Loop track" : "Loop queue";
        const metaParts = [
            loopLabel,
            cfg.sourceName,
            `Queue: ${cfg.queueLength}`,
            cfg.trackRequester,
        ];
        ctx.font = "400 12px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.textAlign = "left";
        ctx.fillText(metaParts.join("   "), innerLeft, y);
    }

    _drawWaveform(ctx, cfg, left, right, topY) {
        const waveW = right - left;
        const waveH = 40;
        const midY = topY + waveH / 2;

        const numBars = 60;
        const slotW = waveW / numBars;
        const barW = Math.max(2, Math.floor(slotW * 0.55));

        const seed = getStringSeed(cfg.trackURI || cfg.songTitle);
        const rng = seededRng(seed);

        const heights = [];
        for (let i = 0; i < numBars; i++) {
            const pos = i / (numBars - 1);
            const envelope = 0.30 + 0.70 * Math.pow(Math.sin(pos * Math.PI), 0.55);
            const noise = rng() * 0.7 + rng() * 0.3;
            heights.push(clamp(noise * envelope, 0.08, 1.0));
        }

        const progress = cfg.totalDurationMs > 0
            ? clamp(cfg.currentPositionMs / cfg.totalDurationMs, 0, 1)
            : 0;

        const progressPx = left + waveW * progress;

        for (let i = 0; i < numBars; i++) {
            const slotCenter = left + (i + 0.5) * slotW;
            const barX = slotCenter - barW / 2;
            const barH = Math.max(3, Math.round(heights[i] * waveH));

            const isPlayed = slotCenter <= progressPx;
            const isNearCurrent = Math.abs(slotCenter - progressPx) < slotW * 2.5;

            if (isPlayed && isNearCurrent) {
                ctx.fillStyle = "#a78bfa";
            } else if (isPlayed) {
                ctx.fillStyle = "#7c3aed";
            } else {
                ctx.fillStyle = "#2a2040";
            }

            ctx.beginPath();
            ctx.roundRect(barX, midY - barH / 2, barW, barH, Math.min(2, barW * 0.4));
            ctx.fill();
        }
    }

    _drawProgress(ctx, cfg, left, right, y) {
        const w = right - left;
        const h = 3;
        const r = 1.5;

        ctx.fillStyle = "#333333";
        ctx.beginPath();
        ctx.roundRect(left, y, w, h, r);
        ctx.fill();

        const progress = cfg.totalDurationMs > 0
            ? clamp(cfg.currentPositionMs / cfg.totalDurationMs, 0, 1)
            : 0;

        if (progress > 0) {
            const fillW = Math.max(h, w * progress);
            ctx.fillStyle = "#7c3aed";
            ctx.beginPath();
            ctx.roundRect(left, y, fillW, h, r);
            ctx.fill();
        }
    }

    _truncate(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) return text;
        let out = text;
        while (out.length > 0 && ctx.measureText(out + "…").width > maxWidth) {
            out = out.slice(0, -1);
        }
        return out + "…";
    }

    _errorCard(width, height) {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "700 22px Arial";
        ctx.fillText("Music card render failed", width / 2, height / 2);
        return canvas.toBuffer("image/png");
    }
}

module.exports = { EnhancedMusicCard };
