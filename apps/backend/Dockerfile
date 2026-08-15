# =============================================
# Ministry of Finance - Complaint Portal Backend
# Multi-stage production build
# =============================================

# ---------- Stage 1: install & build ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and compile TypeScript
RUN npx prisma generate \
  && npm run build

# ---------- Stage 2: production image ----------
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Install production deps (bcrypt native binary built on alpine)
COPY package*.json ./
RUN npm ci --omit=dev \
  && npm rebuild bcrypt --build-from-source

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

# Run migrations at startup (idempotent), then start the server
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main.js"]
