# Discord Music Bot

A simple Discord music bot that plays music from YouTube using voice channels.

## Background

I found this code on GitHub but it wasn't working properly. I fixed the bugs myself and got it running smoothly!

## Features

- Play music from YouTube by name or URL
- Queue system for multiple songs
- Playback controls (play, pause, resume, skip, stop)
- View current queue
- Easy to use commands

## Setup

### Prerequisites
- Node.js (v16 or higher)
- A Discord bot token

### Installation

1. Clone this repository
```bash
git clone https://github.com/Ello858/Discord-Music-Bot.git
cd Discord-Music-Bot
```

2. Install dependencies
```bash
npm install
```

3. Create a `config.json` file in the root directory:
```json
{
  "token": "PUT YOUR TOKEN HERE, TOKEN IS A PASSWORD DONT SHARE IT.",
  "prefix": "!"
}
```

**Important:** Never share your bot token with anyone! Keep `config.json` private.

4. Run the bot
```bash
node index.js
```

## Commands

- `!play <song name or URL>` - Play a song or add it to queue
- `!skip` - Skip the current song
- `!stop` - Stop playing and clear the queue
- `!queue` - Show the current queue
- `!pause` - Pause the current song
- `!resume` - Resume playback
- `!ping` - Check if bot is responsive
- `!cmd` or `!help` - Show all commands

## Getting a Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the token and paste it in your `config.json`
6. Enable these intents: Server Members Intent, Message Content Intent
7. Invite the bot to your server using the OAuth2 URL generator

## Notes

- Make sure the bot has permissions to join voice channels and send messages
- Some videos may not play due to YouTube restrictions or regional blocks
- The bot uses discord-player with multiple extractors for best compatibility

## License

Feel free to use and modify this code for your own projects!