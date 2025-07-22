FROM node:20-slim
WORKDIR /app
COPY server.js .
RUN npm init -y && npm install express cors ws
CMD ["node", "server.js"]