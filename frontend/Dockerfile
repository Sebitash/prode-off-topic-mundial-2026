FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Environment variables will be injected via docker-compose
EXPOSE 3000

CMD ["npm", "run", "dev"]
