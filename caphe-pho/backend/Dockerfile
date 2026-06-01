# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Cài dependencies trước (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Tạo DB seed khi build
RUN node data/seed.js

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "server.js"]
