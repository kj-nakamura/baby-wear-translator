FROM golang:latest

WORKDIR /app

# 依存関係のキャッシュ
COPY go.mod go.sum ./
RUN go mod download

# ソースコードのコピー
COPY . .

# ホットリロードではなくまずは開発サーバーとしてシンプルに起動
EXPOSE 8080
CMD ["go", "run", "cmd/api/main.go"]
