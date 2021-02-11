FROM node:12.16.2 as development

WORKDIR /var/app

COPY package.json yarn.lock ./

RUN yarn install --non-interactive --frozen-lockfile --ignore-optional

WORKDIR /var/app/src/desktop

RUN yarn install --non-interactive --frozen-lockfile --ignore-optional

WORKDIR /var/app

COPY . .

RUN yarn build

CMD [ "yarn", "run", "start" ]

### REMOVE DEV DEPENDENCIES ##
FROM development as dependencies

RUN yarn install --non-interactive --frozen-lockfile --ignore-optional

### BUILD MINIFIED PRODUCTION ##
FROM node:12.16.2-alpine as production

WORKDIR /var/app

COPY --from=dependencies /var/app/package.json /var/app/package.json
COPY --from=dependencies /var/app/healthCheck.js /var/app/healthCheck.js
COPY --from=dependencies /var/app/public /var/app/public
COPY --from=dependencies /var/app/build /var/app/build
COPY --from=dependencies /var/app/src /var/app/src
COPY --from=dependencies /var/app/node_modules /var/app/node_modules

EXPOSE 3000
ENV NODE_ENV production
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 CMD node /var/app/healthCheck.js

CMD [ "node", "build/server.js" ]
