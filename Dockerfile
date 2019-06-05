FROM node:alpine
RUN apk add --no-cache git gnupg
#ENV PATH=/app/:$PATH
#COPY /bin/changelogGenerator /app/changelogGenerator
#ENTRYPOINT ["/app/changelogGenerator"]
WORKDIR /usr/src/app/
COPY /src package.json yarn.lock /usr/src/app/
RUN yarn install --production --frozen-lockfile --ignore-scripts
VOLUME /workspace
WORKDIR /workspace
ENTRYPOINT ["node", "--experimental-modules", "/usr/src/app/index.mjs"]
