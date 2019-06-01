FROM alpine
RUN apk add --no-cache git
ENV PATH=/app/:$PATH
COPY /bin/changelogGenerator /app/changelogGenerator
ENTRYPOINT ["/app/changelogGenerator"]
