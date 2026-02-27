FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Backend is usually a worker or CLI in this stage
CMD ["npm", "run", "test-api"]
