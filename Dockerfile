FROM node:alpine
COPY /bin/index.js /app/
RUN apk add --no-cache git
ENTRYPOINT ["node", "/app/index.js"]
