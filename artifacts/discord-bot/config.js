require('dotenv').config();

module.exports = {
  TOKEN: process.env.BOT_TOKEN || "",
  language: "en",
  ownerID: (process.env.OWNER_ID ? process.env.OWNER_ID.split(",") : [""]),
  mongodbUri: process.env.MONGODB_URI || "mongodb+srv://shiva:shiva@musicbotyt.ouljywv.mongodb.net/?retryWrites=true&w=majority",
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID || "d92baed9605a45a39ed7c2a2d960b1c1",
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || "e9b29f6739de4315bc03b6d8a8e93b03",
  setupFilePath: './commands/setup.json',
  commandsDir: './commands',
  embedColor: "#e11d2e",
  customEmoji: true,
  emojiTheme: "redwhite",
  helpBannerUrl: "https://i.ibb.co/GfTxbJfC/7-edited.png",
  activityName: "YouTube Music",
  activityType: "LISTENING",
  SupportServer: "https://discord.gg/xQF9f9yUEM",
  embedTimeout: 5,
  showProgressBar: false,
  showVisualizer: false,
  generateSongCard: true,
  metadataTag: true,
  lowMemoryMode: true,
  errorLog: "",
  nodes: [
    {
      name: process.env.LAVALINK_NAME || "GlaceYT",
      password: process.env.LAVALINK_PASSWORD || "glace",
      host: process.env.LAVALINK_HOST || "de-01.strixnodes.com",
      port: parseInt(process.env.LAVALINK_PORT || "2010"),
      secure: process.env.LAVALINK_SECURE === "true" ? true : false
    }
  ]
};
