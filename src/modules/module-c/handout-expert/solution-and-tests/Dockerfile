FROM node:22-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app
ENV NODE_ENV=production

# Install only prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Prisma files
COPY prisma/ ./prisma
RUN npm run prisma:generate

# App files
COPY src/ ./src
COPY .env ./.env
COPY seed.sql ./seed.sql

CMD ["npm", "start"]
