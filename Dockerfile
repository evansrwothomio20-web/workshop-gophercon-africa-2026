FROM golang:1.27-alpine AS build
WORKDIR /src

# Modules come from vendor/, so there's nothing to download first.
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/workshop .

# Seed the bundled database before it is copied into the runtime image.
# db seed uses the local mock API, whose source and dataset are in the build context.
RUN /out/workshop --db file:/src/workshop.db db seed

FROM gcr.io/distroless/static-debian12
WORKDIR /app

COPY --from=build /out/workshop /app/workshop
COPY --from=build /src/workshop.db /app/workshop.db

ENV APP_ENV=production \
	PORT=8080 \
	DB_URI=file:/app/workshop.db

EXPOSE 8080
ENTRYPOINT ["/app/workshop", "web"]
