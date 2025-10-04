FROM node:22-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000 \
    BEARER=SECRET_TOKEN_123

# Install only prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# App files
COPY src/server.js ./server.js

EXPOSE 4000
CMD ["node", "server.js"]
