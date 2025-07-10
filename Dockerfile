# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

COPY node_modules/.prisma /app/node_modules/.prisma
COPY node_modules/@prisma /app/node_modules/@prisma

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main"]
