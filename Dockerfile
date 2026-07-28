# Web UI + Node gateway
FROM node:22-bookworm-slim

WORKDIR /app

# Avoid Chromium download if any transitive tool pulls puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV NODE_ENV=production

COPY package.json ./
COPY .npmrc ./

# Use npm install — lockfile may lag package.json after dep removals
RUN npm install --no-audit --no-fund --include=dev

COPY . .

RUN npm run build

RUN npm prune --omit=dev

EXPOSE 3000

ENV PORT=3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=25s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["npm", "start"]
