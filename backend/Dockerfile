# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application and start script from builder
COPY --from=builder /app/dist ./dist
COPY start.sh ./
RUN chmod +x start.sh

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run as non-root user
USER node

# Start command
CMD ["./start.sh"]
