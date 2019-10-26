FROM node:alpine
RUN apk add --no-cache git gnupg

# This is testing for when the package is a binary
#ENV PATH=/app/:$PATH
#COPY /bin/changelogGenerator /app/changelogGenerator
#ENTRYPOINT ["/app/changelogGenerator"]

# This is doing a package build, because I can't get rollup to include externals and still work
WORKDIR /usr/src/app/
COPY package.json yarn.lock /usr/src/app/
RUN yarn install --production --frozen-lockfile --ignore-scripts

COPY /src /usr/src/app/

VOLUME /workspace
WORKDIR /workspace
USER node
ENTRYPOINT ["node", "--experimental-modules", "--no-warnings", "/usr/src/app/index.mjs"]
