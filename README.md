# 🎵 Discord Music Bot

A Discord music bot rebuilt to bring music playback back to life. This project started as a fork of an open-source bot that no longer worked, with its setup reworked around **FFmpeg, Lavalink, and MongoDB**.

The goal is simple: get music playback working reliably while providing a place to store your liked tracks.

## ✨ Features

- 🎧 **Music Playback** — Audio playback powered by Lavalink.
- 🔊 **FFmpeg Integration** — Audio processing support through FFmpeg.
- ❤️ **Liked Tracks** — MongoDB-backed storage for liked tracks.
- 🛠️ **Rebuilt Setup** — Reworked infrastructure to replace the original project's broken setup.
- 🌐 **Discord Integration** — Designed to bring music functionality directly into your Discord server.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Discord API | Discord bot integration |
| Lavalink | Music playback infrastructure |
| FFmpeg | Audio processing |
| MongoDB | Persistent storage for liked tracks |
| Node.js ecosystem | Application runtime and dependencies |

## 🚀 Getting Started

### Prerequisites

Before running the bot, make sure you have access to:

- [Node.js](https://nodejs.org/)
- [FFmpeg](https://ffmpeg.org/)
- A Discord application and bot token
- A running Lavalink server
- A MongoDB instance

*Note: Required versions and configuration details depend on the project's current dependencies.*

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Ello858/Discord-Music-Bot.git
cd Discord-Music-Bot
```

**2. Install dependencies**

This repository uses pnpm.

```bash
pnpm install
```

**3. Configure the environment**

Set up the required environment variables for your Discord bot, Lavalink server, and MongoDB connection.

Check the project configuration and documentation for the exact variable names and required values.

**4. Start the bot**

Use the startup script defined in `package.json`:

```bash
pnpm start
```

If no `start` script is defined, check the available scripts using:

```bash
pnpm run
```

## 🏗️ Infrastructure

The project separates music playback from persistent data storage:

- **Discord** handles the bot's interaction with your server.
- **Lavalink** handles the music playback layer.
- **FFmpeg** provides audio-processing capabilities.
- **MongoDB** stores liked-track data persistently.

This setup allows playback infrastructure and saved user data to serve separate purposes.

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a branch for your changes.
3. Make and test your changes.
4. Open a pull request describing what you changed.

Please check the existing project structure before introducing new dependencies or changing the playback configuration.

## 📜 License

Check the repository for its current license before redistributing or modifying the project.

## 🔗 Repository

[**Ello858/Discord-Music-Bot**](https://github.com/Ello858/Discord-Music-Bot)

If you find the project useful, consider giving the repository a ⭐ on GitHub.
