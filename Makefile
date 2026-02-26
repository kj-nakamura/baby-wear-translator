.PHONY: up down down-all logs build restart gen

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

# OpenAPIからGoとTypeScriptのコードを自動生成
gen:
	@echo "Generating backend code..."
	cd apps/recommender-service && go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest -config oapi-codegen.yaml ../../packages/openapi/openapi.yaml
	@echo "Generating frontend code..."
	cd apps/frontend && npx openapi-typescript ../../packages/openapi/openapi.yaml -o src/types/openapi.d.ts
