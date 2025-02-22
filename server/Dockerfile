
FROM node:22-alpine AS node

WORKDIR /var/www/app

COPY package.json package-lock.json ./
RUN npm install

COPY prisma ./prisma

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /var/www/app

COPY --from=node /var/www/app/dist ./dist
COPY --from=node /var/www/app/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "dist/src/main.js"]