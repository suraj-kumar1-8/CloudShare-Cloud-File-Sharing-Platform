# ── Stage 1: dependencies ──────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
# Copy only production dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source files
COPY . .
# Do not run as root inside the container
USER node
EXPOSE 5001
CMD ["node", "src/server.js"]
