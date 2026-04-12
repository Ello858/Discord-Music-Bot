<div align="center">

# ElloMusic - Discord Music Bot

![Version](https://img.shields.io/badge/version-1.5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)

**A feature-rich Discord music bot powered by Lavalink and Discord.js v14**

---

### 🔗 Connect

[![GitHub](https://img.shields.io/badge/GitHub-Ello858-181717?style=for-the-badge&logo=github)](https://github.com/Ello858)
[![Repo](https://img.shields.io/badge/Repo-Discord--Music--Bot-blue?style=for-the-badge&logo=github)](https://github.com/Ello858/Discord-Music-Bot)

---

[Features](#-features) • [Requirements](#-requirements) • [Installation](#-installation) • [Configuration](#-configuration) • [Commands](#-commands)

</div>

---

## ✨ Features

### 🎶 Music
- **Multi-platform**: YouTube, SoundCloud, Spotify (tracks, albums, playlists)
- **Queue management**: shuffle, loop, move, remove, jump
- **Custom playlists**: create, save, load, and manage your own playlists
- **Autoplay**: continuous playback when the queue ends
- **24/7 mode**: keep the bot in a voice channel around the clock
- **Music cards**: auto-generated song cards with album art
- **Track history**: automatically logs recently played songs
- **Audio filters**: bassboost, nightcore, karaoke, and more
- **Vote skip**: democratic skipping for shared servers

### 🌍 Languages
English, Spanish, French, German, Japanese, Korean, Russian — switch with `/language`

### ⚡ Performance
- Low-memory mode for budget hosting (works on 512MB+)
- Efficient Lavalink audio — no FFmpeg required
- Smart thumbnail fetching with automatic fallback

---

## 📋 Requirements

- **Node.js** v16.0.0 or higher
- **Discord Bot Token** — [Discord Developer Portal](https://discord.com/developers/applications)
- **Lavalink Node** — self-hosted or a public node
- **MongoDB** — for playlists and history
- **Spotify API** *(optional)* — for Spotify support

---

## 🚀 Installation

### 1. Clone the repo
```bash
git clone https://github.com/Ello858/Discord-Music-Bot.git
cd Discord-Music-Bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables

Create a `.env` file:
```env
BOT_TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_connection_string
OWNER_ID=your_discord_user_id
SPOTIFY_CLIENT_ID=optional
SPOTIFY_CLIENT_SECRET=optional
LAVALINK_HOST=your_lavalink_host
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```

### 4. Enable Discord Intents

In the [Discord Developer Portal](https://discord.com/developers/applications):
- Go to **Bot** → **Privileged Gateway Intents**
- Enable **Message Content Intent** and **Server Members Intent**

### 5. Run
```bash
npm start
```

---

## ⚙️ Configuration

Edit `config.js` to customise behaviour:

| Option | Description | Default |
|--------|-------------|---------|
| `language` | Default language | `"en"` |
| `ownerID` | Bot owner user ID(s) | `[]` |
| `embedColor` | Embed accent colour (hex) | `"#e11d2e"` |
| `activityName` | Bot status text | `"YouTube Music"` |
| `lowMemoryMode` | Optimise for low-RAM hosts | `true` |
| `generateSongCard` | Show music card images | `true` |
| `customEmoji` | Use custom server emojis | `false` |

---

## 🎮 Commands

### Music
| Command | Description |
|---------|-------------|
| `/play <song>` | Play from YouTube, SoundCloud, or Spotify |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/skip` | Skip the current track |
| `/stop` | Stop and clear the queue |
| `/queue` | View the queue |
| `/nowplaying` | Show current track info |
| `/volume <1-100>` | Set volume |
| `/seek <time>` | Jump to a position in the track |
| `/loop` | Toggle loop (track / queue) |
| `/shuffle` | Shuffle the queue |
| `/filters` | Apply audio filters |
| `/autoplay` | Toggle autoplay |

### Playlist
| Command | Description |
|---------|-------------|
| `/createplaylist <name>` | Create a new playlist |
| `/addsong <playlist>` | Add the current song to a playlist |
| `/myplaylists` | List your playlists |
| `/playcustomplaylist <name>` | Play one of your playlists |
| `/savequeue <name>` | Save the current queue as a playlist |

### Utility
| Command | Description |
|---------|-------------|
| `/history` | View recently played songs |
| `/trackinfo` | Detailed info on the current track |
| `/language <code>` | Change the bot language |
| `/help` | List all commands |
| `/ping` | Check bot latency |
| `/stats` | Bot stats and uptime |

---

## 📁 Project Structure

```
Discord-Music-Bot/
├── commands/
│   ├── basic/       # help, ping, stats, support
│   ├── music/       # play, pause, skip, filters...
│   ├── playlist/    # create, save, load playlists
│   └── utility/     # history, language, emoji
├── events/          # Discord event handlers
├── languages/       # en, es, fr, de, ja, ko, ru
├── utils/           # music cards, validation, responses
├── UI/              # icons, colours, emoji data
├── config.js        # bot configuration
├── player.js        # music player logic
├── lavalink.js      # Lavalink node manager
└── index.js         # entry point
```

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made by [ello.txt](https://github.com/Ello858)

</div>
