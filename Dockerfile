FROM node:16.15 as base

WORKDIR /var/app

COPY package.json yarn.lock ./
COPY src/desktop/package.json src/desktop/yarn.lock ./src/desktop/

RUN yarn install --non-interactive --frozen-lockfile --ignore-optional
RUN yarn install --non-interactive --frozen-lockfile --ignore-optional --cwd src/desktop

COPY . .

RUN yarn build

### REMOVE DEV DEPENDENCIES ##
FROM base as dependencies

RUN yarn install --non-interactive --frozen-lockfile --ignore-optional --production

### BUILD MINIFIED PRODUCTION ##
FROM node:12.16.2-alpine as production

# Add Tini
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

ENTRYPOINT ["/tini", "--"]

WORKDIR /var/app

COPY --from=dependencies /var/app/package.json /var/app/package.json
COPY --from=dependencies /var/app/healthCheck.js /var/app/healthCheck.js
COPY --from=dependencies /var/app/public /var/app/public
COPY --from=dependencies /var/app/build /var/app/build
COPY --from=dependencies /var/app/node_modules /var/app/node_modules

HEALTHCHECK --interval=15s --timeout=5s CMD node /var/app/healthCheck.js

EXPOSE 3000
CMD [ "yarn", "run", "start:prod" ]
