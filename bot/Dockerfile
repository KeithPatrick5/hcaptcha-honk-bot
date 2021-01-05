FROM node:12.20.0
ENV NODE_ENV=production
ENV BOT_NAME=
ENV MONGO_URL=
ENV BOT_TOKEN=
ENV BOT_ID=
ENV ADMINS=
ENV TIMEOUT=
ENV WEBAPP_URI=
ENV RABBIT_MQ_USER=rabbitmq
ENV RABBIT_MQ_PASS=rabbitmq

WORKDIR /app
COPY src ./src
COPY index.js .
COPY package.json . 
RUN npm install
CMD ["node","index.js"]