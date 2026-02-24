.PHONY: up down down-all logs build restart

# コンテナの起動（バックグラウンド）
up:
	docker compose up -d

# コンテナの停止
down:
	docker compose down

# コンテナとボリューム等の完全削除
down-all:
	docker compose down --rmi all --volumes --remove-orphans

# ログの確認（Ctrl+Cで退出）
logs:
	docker compose logs -f

# コンテナのビルド
build:
	docker compose build

# コンテナの再起動
restart:
	docker compose restart
