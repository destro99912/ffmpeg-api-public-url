# Use a full Node image with Debian base
FROM node:18-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    build-essential \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy remaining files
COPY . .

# Expose port (make sure this matches your server)
EXPOSE 8080

# Start server
CMD ["npm", "start"]
