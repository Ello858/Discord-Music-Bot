// -------------------------
// Required modules
// -------------------------
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const extractor = require('@discord-player/extractor');
const config = require('./config.json');

// -------------------------
// Create Discord client
// -------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// -------------------------
// Create the player
// -------------------------
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});

// -------------------------
// Command prefix
// -------------------------
const PREFIX = config.prefix;

// -------------------------
// Bot ready - Load extractors after bot is ready
// -------------------------
client.once('ready', async () => {
    console.log(`==============================`);
    console.log(`Bot is online as ${client.user.tag}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Discord.js version: ${require('discord.js').version}`);
    console.log(`discord-player version: ${require('discord-player/package.json').version}`);
    
    // Register all default extractors (includes YouTube via play-dl)
    try {
        await player.extractors.loadMulti(extractor.DefaultExtractors);
        console.log(`✅ Extractors loaded successfully!`);
    } catch (error) {
        console.log(`❌ Extractor error:`, error.message);
    }
    
    console.log(`==============================`);
});

// -------------------------
// Listen for messages
// -------------------------
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // -------------------------
    // !play command
    // -------------------------
    if (command === "play") {
        const query = args.join(" ");
        if (!query) return message.reply("❌ Please provide a search term or URL!");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("❌ You must be in a voice channel!");

        try {
            // Get or create queue
            let queue = player.nodes.get(message.guild.id);
            
            // Always recreate if queue doesn't exist or connection is broken
            if (!queue || !queue.connection) {
                // Delete old queue if it exists but is broken
                if (queue) {
                    queue.delete();
                }
                
                queue = player.nodes.create(message.guild, {
                    metadata: { channel: message.channel },
                    selfDeaf: true,
                    volume: 80,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 300000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 300000
                });
                
                await queue.connect(voiceChannel);
            }

            // Search for the track
            const searchResult = await player.search(query, {
                requestedBy: message.author
            });

            if (!searchResult || !searchResult.tracks.length) {
                return message.reply("❌ No results found! Try a different search term or URL.");
            }

            // Add track(s) to queue
            if (searchResult.playlist) {
                queue.addTrack(searchResult.tracks);
                message.reply(`📃 Added playlist: **${searchResult.playlist.title}** (${searchResult.tracks.length} tracks)`);
            } else {
                queue.addTrack(searchResult.tracks[0]);
                message.reply(`🎵 Added to queue: **${searchResult.tracks[0].title}**`);
            }

            // Start playing if not already playing
            if (!queue.isPlaying()) {
                await queue.node.play();
            }

        } catch (err) {
            console.error('Play error:', err);
            
            // Provide more helpful error messages
            if (err.message.includes('Sign in to confirm') || err.message.includes('age')) {
                message.reply("❌ This video has age restrictions. Try a different video!");
            } else if (err.message.includes('Video unavailable')) {
                message.reply("❌ This video is unavailable. Try searching for it differently!");
            } else {
                message.reply(`❌ Could not play the song. Try:\n- Using a different search term\n- Pasting a direct YouTube URL\n- Trying another song\nError: ${err.message}`);
            }
        }
    }

    // -------------------------
    // !skip command
    // -------------------------
    if (command === "skip") {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply("❌ Nothing is playing!");
        }
        queue.node.skip();
        message.reply("⏭️ Skipped!");
    }

    // -------------------------
    // !stop command
    // -------------------------
    if (command === "stop") {
        const queue = player.nodes.get(message.guild.id);
        if (!queue) {
            return message.reply("❌ Nothing is playing!");
        }
        queue.node.stop();
        queue.delete();
        message.reply("⏹️ Stopped and cleared queue!");
    }

    // -------------------------
    // !queue command
    // -------------------------
    if (command === "queue") {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.currentTrack) {
            return message.reply("❌ Nothing is playing!");
        }
        
        const current = queue.currentTrack;
        const tracks = queue.tracks.toArray().slice(0, 10);
        
        let queueString = `🎵 **Now Playing:**\n${current.title}\n\n`;
        if (tracks.length > 0) {
            queueString += `**Up Next:**\n`;
            tracks.forEach((track, i) => {
                queueString += `${i + 1}. ${track.title}\n`;
            });
        }
        
        message.reply(queueString);
    }

    // -------------------------
    // !cmd or !help command
    // -------------------------
    if (command === "cmd" || command === "help" || command === "commands") {
        const helpMessage = `
🎵 **Music Bot Commands** 🎵

\`!play <song name or URL>\` - Play a song or add it to queue
\`!skip\` - Skip the current song
\`!stop\` - Stop playing and clear the queue
\`!queue\` - Show the current queue
\`!pause\` - Pause the current song
\`!resume\` - Resume playback
\`!ping\` - Check if bot is responsive
\`!cmd\` or \`!help\` - Show this message
        `;
        message.reply(helpMessage);
    }

    // -------------------------
    // !pause command
    // -------------------------
    if (command === "pause") {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply("❌ Nothing is playing!");
        }
        queue.node.pause();
        message.reply("⏸️ Paused!");
    }

    // -------------------------
    // !resume command
    // -------------------------
    if (command === "resume") {
        const queue = player.nodes.get(message.guild.id);
        if (!queue) {
            return message.reply("❌ Nothing is playing!");
        }
        queue.node.resume();
        message.reply("▶️ Resumed!");
    }

    // -------------------------
    // !ping command
    // -------------------------
    if (command === "ping") {
        message.reply("🏓 Pong!");
    }
});

// -------------------------
// LOGIN
// -------------------------
client.login(config.token);