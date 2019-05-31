FROM node:alpine
COPY ./src package.json yarn.lock /
RUN apk add --no-cache git
RUN yarn install \
        --production \
        --frozen-lockfile \
        --ignore-scripts \
        --no-cache;
ENTRYPOINT ["node", "--experimental-modules", "index.mjs"]
