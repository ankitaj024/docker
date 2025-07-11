# Use Debian-based Node.js image for stability
FROM node:18-slim

# Install CA certificates and other necessary dependencies
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8500

CMD ["node", "dist/main"]
