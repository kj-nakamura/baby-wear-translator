# Build stage
FROM golang:1.26-alpine AS build

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN go build -o main cmd/api/main.go

# Production stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=build /app/main .

EXPOSE 8080
CMD ["./main"]
