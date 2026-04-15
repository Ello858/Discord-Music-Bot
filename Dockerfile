# Use Node.js 18 LTS
FROM node:18-alpine

# Install build tools needed for @napi-rs/canvas (native module)
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev

# Set working directory to the actual bot folder
WORKDIR /app

# Copy only the bot's package.json first (for layer caching)
COPY artifacts/discord-bot/package.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the bot source
COPY artifacts/discord-bot/ .

# Start the bot
CMD ["node", "index.js"]
