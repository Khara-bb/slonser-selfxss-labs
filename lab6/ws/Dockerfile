FROM node:20-alpine
WORKDIR /app
COPY package.json .
COPY websocket-server.js .
RUN npm install
CMD ["node", "websocket-server.js"]