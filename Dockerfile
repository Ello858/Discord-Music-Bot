# Use Node.js 18 (LTS, compatible with your bot)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the bot files
COPY . .

# Expose no ports (Discord bot — no HTTP server needed)
# Just start the bot
CMD ["node", "index.js"]
