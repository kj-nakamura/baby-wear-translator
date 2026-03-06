# Baby Wear Translator

## 概要

Baby Wear Translator は、ショップごとに異なるベビー服の呼称（コンビ肌着、プレオール等）の差異を吸収し、赤ちゃんの生年月日、現在の月齢、およびリアルタイムの外気温（北海道・北広島など）から「今着せるべき最適なベビー服の組み合わせ」を提案するツールです。

フロントエンドにはカレンダービューを採用し、日々の気温遷移と実際の着替え履歴、今後の推薦服をひと目で把握できるように設計されています。

## コンセプト

- **呼称の標準化**: メーカーやショップで異なるベビー服の呼び方を統一的に扱います。
- **パーソナライズ**: 赤ちゃんの月齢（成長段階）に合わせたサイズや種類を提案します。
- **環境適応**: リアルタイムの気象データに基づき、その日の気温に最適なレイヤリングをアドバイスします。
- **成長の記録**: カレンダー形式で日々の服装を記録し、成長の軌跡として残せます。

## 技術スタック

### バックエンド (Microservices & BFF)
- **言語**: Go 1.26
- **Webフレームワーク**: Gin
- **API形式**: RESTful API (OpenAPI 3.0)

### フロントエンド
- **言語**: TypeScript
- **フレームワーク**: Next.js (App Router)
- **UIコンポーネント**: Vanilla CSS (TailwindCSS非推奨方針)
- **APIクライアント**: OpenAPI Generator による型安全な通信

### インフラ・開発環境
- **コンテナ管理**: Docker / Docker Compose
- **IaC**: Pulumi (TypeScript)
- **仕様管理**: OpenAPI (openapi.yaml)

## アーキテクチャ & ディレクトリ構成

モノレポ構成を採用し、フロントエンド、BFF、および各マイクロサービスを一つのリポジトリで管理しています。

```text
baby-wear-translator/
├── apps/                         # アプリケーション
│   ├── frontend/                 # Next.js (TypeScript)
│   ├── bff/                      # BFFサービス (Go + Gin) [予定]
│   ├── weather-service/          # 気象情報サービス (Go + Gin) [予定]
│   └── recommender-service/      # 服の推薦・履歴管理サービス (Go + Gin)
│
├── packages/                     # 共通パッケージ
│   ├── openapi/                  # OpenAPI定義ファイル (openapi.yaml)
│   └── api-client-ts/            # 自動生成されたTS用APIクライアント
│
├── infrastructure/               # IaC (Pulumi)
├── docker-compose.yml            # サービス一括起動
├── go.work                       # Go マルチモジュール管理
└── Makefile                      # 開発用コマンド
```

## 開発環境の構築

### プリリクエスト
- Docker / Docker Compose
- Go 1.26+ (ローカルでの開発・生成用)
- Node.js / npm (フロントエンド用)

### クイックスタート

1. **コンテナの起動**:
   ```bash
   make up
   ```
   フロントエンド (http://localhost:3000) とバックエンド (http://localhost:8080) が起動します。

2. **ログの確認**:
   ```bash
   make logs
   ```

3. **コードの自動生成 (OpenAPI)**:
   API定義 (`packages/openapi/openapi.yaml`) を変更した後は、以下のコマンドでコードを再生成します。
   ```bash
   make gen
   ```

### Makefile コマンド一覧

| コマンド | 内容 |
| :--- | :--- |
| `make up` | 全コンテナをバックグラウンドで起動 |
| `make down` | コンテナの停止 |
| `make logs` | コンテナのログを表示 |
| `make build` | コンテナの再ビルド |
| `make gen` | OpenAPI定義からGo/TSコードを生成 |
| `make restart` | コンテナの再起動 |

## API仕様

APIの仕様は `packages/openapi/openapi.yaml` で定義されています。Swagger UIなどを利用して確認・編集が可能です。

## ライセンス

[MIT License](LICENSE) (またはプロジェクトに適したライセンス)
