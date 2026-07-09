FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx tsc -p tsconfig.build.json

EXPOSE 5000

CMD ["node", "dist/server.js"]