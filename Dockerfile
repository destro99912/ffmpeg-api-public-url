# Use an official Node.js image with Debian base
FROM node:18-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy remaining files
COPY . .

# Expose port (match your index.mjs)
EXPOSE 8080

# Start server
CMD ["npm", "start"]
