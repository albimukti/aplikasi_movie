# Production Runner stage using Alpine
FROM alpine:3.20

RUN apk add --no-cache ca-certificates ffmpeg tzdata

WORKDIR /app

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY moviehub-server-linux /app/moviehub-server
COPY migrations /app/migrations

RUN mkdir -p /app/uploads/posters /app/uploads/backdrops /app/uploads/videos /app/uploads/subtitles /app/uploads/qris \
    && chown -R appuser:appgroup /app \
    && chmod +x /app/moviehub-server

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/health || exit 1

ENTRYPOINT ["/app/moviehub-server"]
