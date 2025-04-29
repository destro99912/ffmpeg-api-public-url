FROM node:18-bullseye

# Prevent interactive prompt issues
ENV DEBIAN_FRONTEND=noninteractive

# Install only essential packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files and install dependencies cleanly
COPY package.json ./
RUN npm install --omit=dev

# Copy all other source files
COPY . .

# Set port and start
EXPOSE 8080
CMD ["npm", "start"]
