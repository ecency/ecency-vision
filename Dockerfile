FROM node:12.16.2 as development

WORKDIR /var/app

COPY package.json yarn.lock ./

RUN yarn install --non-interactive --frozen-lockfile --ignore-optional

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
COPY --from=dependencies /var/app/public /var/app/public
COPY --from=dependencies /var/app/build /var/app/build
COPY --from=dependencies /var/app/src /var/app/src
COPY --from=dependencies /var/app/node_modules /var/app/node_modules

CMD [ "yarn", "run", "start:prod" ]
