FROM node:24-alpine

ENV NODE_ENV=production \
    DB_PATH=/data/data.sqlite3

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data

EXPOSE 3000

# Migrations run automatically on startup (see server.js)
CMD ["node", "server.js"]
