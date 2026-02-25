FROM node:20-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# その他のソースをコピー
COPY . .

EXPOSE 3000

# ホットリロードのためのポーリング設定を環境変数で可能にする
ENV WATCHPACK_POLLING=true

CMD ["npm", "run", "dev"]
