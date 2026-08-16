FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Ensure dev dependencies are installed for the build step
RUN npm ci --include=dev

COPY . .

RUN npm run build

# Remove devDependencies for smaller image size (optional)
RUN npm prune --omit=dev

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
