FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" \
    npx prisma generate --config prisma7.config.ts
RUN npm run build

FROM node:22-bookworm-slim AS production-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
