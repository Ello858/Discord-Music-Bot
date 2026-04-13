const { createCanvas } = require("@napi-rs/canvas");

const THEME = {
    bg: "#0b0b14",
    card: "#13131f",
    cardBorder: "rgba(139, 92, 246, 0.18)",
    accentBright: "#a78bfa",
    accentMid: "#7c3aed",
    accentDim: "rgba(139, 92, 246, 0.20)",
    accentGlow: "rgba(139, 92, 246, 0.10)",
    title: "#ffffff",
    artist: "#a0a0c0",
    metaText: "#5a5a78",
    dotSep: "#3a3a58",
    playBg: "#1c1c30",
    playBorder: "rgba(139, 92, 246, 0.40)",
    progressBg: "rgba(255, 255, 255, 0.08)",
    nowPlayingLabel: "#8b5cf6",
    timeText: "#6b6b90",
};

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
    const s = String(str || "default");
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(33, h) ^ s.charCodeAt(i);
    }
    return Math.abs(h >>> 0);
}

class EnhancedMusicCard {
    async generateCard(options = {}) {
        const cfg = {
            width: 900,
            height: 290,
            trackURI: options.trackURI || options.thumbnailURL || "",
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
        const PAD = 26;

        ctx.fillStyle = THEME.bg;
        ctx.fillRect(0, 0, W, H);

        const cx = 14, cy = 14, cw = W - 28, ch = H - 28;
        const r = 18;

        ctx.fillStyle = THEME.card;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cw, ch, r);
        ctx.fill();

        const glow = ctx.createRadialGradient(W * 0.5, H * 0.28, 0, W * 0.5, H * 0.28, W * 0.55);
        glow.addColorStop(0, THEME.accentGlow);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cw, ch, r);
        ctx.fill();

        ctx.strokeStyle = THEME.cardBorder;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cw, ch, r);
        ctx.stroke();

        const innerLeft = cx + PAD;
        const innerRight = cx + cw - PAD;

        this._drawHeader(ctx, cfg, cx, cy, innerLeft, innerRight);
        this._drawWaveform(ctx, cfg, cx, cy, innerLeft, innerRight);
        this._drawInfoLine(ctx, cfg, cx, cy, innerLeft, innerRight);
    }

    _drawHeader(ctx, cfg, cx, cy, innerLeft, innerRight) {
        const boxSize = 56;
        const boxX = innerLeft;
        const boxY = cy + 22;

        ctx.fillStyle = THEME.playBg;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxSize, boxSize, 12);
        ctx.fill();

        ctx.strokeStyle = THEME.playBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxSize, boxSize, 12);
        ctx.stroke();

        const triCx = boxX + boxSize * 0.52;
        const triCy = boxY + boxSize * 0.5;
        const triH = 16;
        const triW = triH * 0.88;
        const playGrad = ctx.createLinearGradient(triCx - triW * 0.5, triCy - triH * 0.5, triCx + triW * 0.5, triCy + triH * 0.5);
        playGrad.addColorStop(0, THEME.accentBright);
        playGrad.addColorStop(1, THEME.accentMid);
        ctx.fillStyle = playGrad;
        ctx.beginPath();
        ctx.moveTo(triCx - triW * 0.48, triCy - triH * 0.5);
        ctx.lineTo(triCx - triW * 0.48, triCy + triH * 0.5);
        ctx.lineTo(triCx + triW * 0.52, triCy);
        ctx.closePath();
        ctx.fill();

        const textX = boxX + boxSize + 18;
        const maxW = innerRight - textX;

        ctx.fillStyle = THEME.nowPlayingLabel;
        ctx.font = "700 10.5px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("NOW PLAYING", textX, boxY + 17);

        ctx.fillStyle = THEME.title;
        ctx.font = "700 27px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(this._truncate(ctx, cfg.songTitle, maxW), textX, boxY + 40);

        ctx.fillStyle = THEME.artist;
        ctx.font = "400 15px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(this._truncate(ctx, cfg.songArtist, maxW), textX, boxY + 60);
    }

    _drawWaveform(ctx, cfg, cx, cy, innerLeft, innerRight) {
        const waveTop = cy + 104;
        const waveH = 68;
        const waveLeft = innerLeft;
        const waveRight = innerRight;
        const waveW = waveRight - waveLeft;

        const numBars = 55;
        const totalSlotW = waveW / numBars;
        const barW = Math.max(2, Math.floor(totalSlotW * 0.72));

        const seed = getStringSeed(cfg.trackURI || cfg.songTitle);
        const rng = seededRng(seed);

        const heights = [];
        for (let i = 0; i < numBars; i++) {
            const pos = i / (numBars - 1);
            const envelope = 0.35 + 0.65 * Math.pow(Math.sin(pos * Math.PI), 0.6);
            const noise = rng() * 0.65 + rng() * 0.35;
            heights.push(clamp(noise * envelope, 0.08, 1.0));
        }

        const progress = cfg.totalDurationMs > 0
            ? clamp(cfg.currentPositionMs / cfg.totalDurationMs, 0, 1)
            : (cfg.currentPositionMs > 0 ? 0.05 : 0);

        const progressPx = waveLeft + waveW * progress;

        for (let i = 0; i < numBars; i++) {
            const slotCenter = waveLeft + (i + 0.5) * totalSlotW;
            const barX = slotCenter - barW / 2;
            const barH = Math.max(3, Math.round(heights[i] * waveH));
            const barTop = waveTop + waveH - barH;

            const isPlayed = slotCenter <= progressPx;

            if (isPlayed) {
                const g = ctx.createLinearGradient(barX, barTop, barX, barTop + barH);
                g.addColorStop(0, THEME.accentBright);
                g.addColorStop(1, THEME.accentMid);
                ctx.fillStyle = g;
            } else {
                ctx.fillStyle = THEME.accentDim;
            }
            ctx.beginPath();
            ctx.roundRect(barX, barTop, barW, barH, Math.min(2, barW * 0.3));
            ctx.fill();
        }

        const lineY = waveTop + waveH + 12;
        const lineH = 3;
        const lineR = 1.5;

        ctx.fillStyle = THEME.progressBg;
        ctx.beginPath();
        ctx.roundRect(waveLeft, lineY, waveW, lineH, lineR);
        ctx.fill();

        if (progress > 0) {
            const fillW = Math.max(lineH, waveW * progress);
            const fillGrad = ctx.createLinearGradient(waveLeft, lineY, waveLeft + fillW, lineY);
            fillGrad.addColorStop(0, THEME.accentMid);
            fillGrad.addColorStop(1, THEME.accentBright);
            ctx.fillStyle = fillGrad;
            ctx.beginPath();
            ctx.roundRect(waveLeft, lineY, fillW, lineH, lineR);
            ctx.fill();

            const dotX = waveLeft + fillW;
            const dotY = lineY + lineH / 2;
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = THEME.accentBright;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        const timeY = lineY + 19;
        ctx.font = "500 12px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = THEME.timeText;
        ctx.textBaseline = "alphabetic";

        ctx.textAlign = "left";
        ctx.fillText(formatDuration(cfg.currentPositionMs), waveLeft, timeY);

        ctx.textAlign = "right";
        ctx.fillText(
            cfg.totalDurationMs > 0 ? formatDuration(cfg.totalDurationMs) : "LIVE",
            waveRight,
            timeY
        );
    }

    _drawInfoLine(ctx, cfg, cx, cy, innerLeft, innerRight) {
        const infoY = cy + (290 - 28) - 14;

        const stateLabel = cfg.isPaused ? "Paused" : "Playing";
        const loopLabel = cfg.loopMode === "none" ? "Loop off" : cfg.loopMode === "track" ? "Loop track" : "Loop queue";
        const durationText = cfg.totalDurationMs > 0 ? formatDuration(cfg.totalDurationMs) : "LIVE";
        const queueText = `${cfg.queueLength} ${cfg.queueLength === 1 ? "song" : "songs"} in queue`;

        const parts = [stateLabel, loopLabel, durationText, cfg.trackRequester, cfg.sourceName, queueText];
        const sep = "  ";

        ctx.font = "400 12px 'Segoe UI', Arial, sans-serif";
        ctx.textBaseline = "alphabetic";

        let x = innerLeft;
        for (let i = 0; i < parts.length; i++) {
            ctx.fillStyle = THEME.artist;
            ctx.textAlign = "left";
            ctx.fillText(parts[i], x, infoY);
            x += ctx.measureText(parts[i]).width;

            if (i < parts.length - 1) {
                ctx.fillStyle = THEME.dotSep;
                ctx.fillText(sep, x, infoY);
                x += ctx.measureText(sep).width;
            }
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
        ctx.fillStyle = "#1c1c1c";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "700 28px Arial";
        ctx.fillText("Music card render failed", width / 2, height / 2);
        return canvas.toBuffer("image/png");
    }
}

module.exports = { EnhancedMusicCard };
