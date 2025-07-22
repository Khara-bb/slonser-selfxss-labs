FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install express cookie-parser
EXPOSE 3000
CMD ["node", "server.js"]
