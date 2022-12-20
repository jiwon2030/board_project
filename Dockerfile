FROM node:16

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
EXPOSE 8000
CMD ["node", "run", "start"]