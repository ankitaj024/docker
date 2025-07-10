# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .


# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main"]
