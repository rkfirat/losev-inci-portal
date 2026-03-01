FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client and Build
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start command running migrations first then the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
