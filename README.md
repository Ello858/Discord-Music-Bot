# Discord Music Bot

A Discord music bot that plays music from YouTube and SoundCloud using voice channels.

## Background

I found this code on GitHub but it wasn't working properly. I fixed the bugs myself and got it running smoothly on Railway!

## Features

- Play music from YouTube and SoundCloud by name or URL
- Queue system for multiple songs
- Playback controls (play, pause, resume, skip, stop)
- View current queue
- Easy to use commands
- 24/7 hosting on Railway (free tier)

## Setup

### Prerequisites
- Node.js (v20 or higher)
- A Discord bot token
- Railway account (for 24/7 hosting) OR your own computer for local hosting

### Local Installation (Testing)

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
  "token": "YOUR_BOT_TOKEN_HERE",
  "prefix": "!"
}
```

**Important:** Never share your bot token with anyone! Keep `config.json` private and never commit it to GitHub.

4. Run the bot locally
```bash
node index.js
```

### Railway Deployment (24/7 Hosting)

1. **Push your code to GitHub** (without `config.json` - it's in `.gitignore`)

2. **Sign up for Railway** at [railway.app](https://railway.app)

3. **Connect GitHub:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `Discord-Music-Bot` repository
   - Railway will auto-detect it's a Node.js project

4. **Add your bot token as an environment variable:**
   - Go to your project in Railway
   - Click on your service
   - Go to "Variables" tab
   - Click "New Variable"
   - Add: `BOT_TOKEN` with your Discord bot token as the value

5. **Railway will automatically deploy!** The bot will be online 24/7 (with free tier limitations)

### Important Files

- `index.js` - Main bot code
- `config.json` - Bot token (local only, NOT on GitHub)
- `nixpacks.toml` - Railway configuration for FFmpeg and dependencies
- `railway.toml` - Railway deployment settings

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
5. Copy the token and paste it in your `config.json` or Railway environment variable
6. Enable these intents under "Privileged Gateway Intents":
   - Server Members Intent
   - Message Content Intent
7. Go to OAuth2 → URL Generator:
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Connect`, `Speak`
8. Copy the generated URL and use it to invite the bot to your server

## Railway Free Tier Limitations

- **~20 days of runtime per month** (500 hours)
- After the free hours run out, you can either:
  - Upgrade to Railway's paid plan (~$5/month)
  - Run the bot locally on your computer using PM2 for the remaining days
  - Wait until next month when hours reset

## Running Locally with PM2 (Alternative to Railway)

If you want to run the bot 24/7 on your own computer:

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot
pm2 start index.js --name discord-bot

# Make it auto-start on boot
pm2 startup
pm2 save

# Useful PM2 commands
pm2 status          # Check status
pm2 logs discord-bot # View logs
pm2 restart discord-bot # Restart
pm2 stop discord-bot    # Stop
```

## Troubleshooting

### Bot joins but doesn't play music
- Make sure you're using headphones to avoid audio feedback/echo
- Check Railway logs for errors
- Verify FFmpeg is installed (should show in Railway build logs)

### "No results found" error
- Try being more specific with song names
- Include artist name: `!play never gonna give you up rick astley`
- Try using a direct YouTube URL
- Some videos may be region-restricted

### Bot goes offline on Railway
- Check if you've used up your free hours for the month
- View Railway logs for error messages
- Verify your `BOT_TOKEN` environment variable is set correctly

## Notes

- The bot uses FFmpeg for audio processing
- Audio quality is set to "highestaudio" for best quality
- The bot auto-deafens itself in voice channels
- Queue is cleared when the bot stops or leaves the voice channel

## Credits

Built with:
- discord.js - Discord API wrapper
- discord-player - Music player functionality
- @discord-player/extractor - YouTube/SoundCloud extractors

## License

Feel free to use and modify this code for your own projects!