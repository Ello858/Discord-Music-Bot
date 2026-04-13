require('dotenv').config();

module.exports = {
  TOKEN: process.env.BOT_TOKEN || "",
  language: "en",
  ownerID: (process.env.OWNER_ID ? process.env.OWNER_ID.split(",") : ["852865569786691636"]),
  mongodbUri: process.env.MONGODB_URI || "",
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID || "",
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  setupFilePath: './commands/setup.json',
  commandsDir: './commands',
  embedColor: "#e11d2e",
  customEmoji: false,
  emojiTheme: "redwhite",
  helpBannerUrl: "https://i.ibb.co/GfTxbJfC/7-edited.png",
  activityName: "YouTube Music",
  activityType: "LISTENING",
  SupportServer: "https://github.com/Ello858/Discord-Music-Bot",
  embedTimeout: 5,
  showProgressBar: false,
  showVisualizer: false,
  generateSongCard: true,
  metadataTag: true,
  lowMemoryMode: true,
  errorLog: "",
  nodes: [
    {
      name: process.env.LAVALINK_NAME || "ElloMusic",
      password: process.env.LAVALINK_PASSWORD || "",
      host: process.env.LAVALINK_HOST || "de-01.strixnodes.com",
      port: parseInt(process.env.LAVALINK_PORT || "2010"),
      secure: process.env.LAVALINK_SECURE === "true" ? true : false
    }
  ]
};
