FROM node:12

ENV NODE_ENV production

ENV APP_DIR /ecency

RUN mkdir -p ${APP_DIR}

COPY . ${APP_DIR}

WORKDIR ${APP_DIR}

RUN yarn

RUN yarn run build

EXPOSE 3000

CMD [ "node", "build/server.js" ]

