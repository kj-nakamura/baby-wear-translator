## プロジェクト概要

応答は可能な限り日本語で行ってください。

### 1. プロジェクト定義
名称:
Baby Wear Translator

コンセプト:
ショップごとに異なるベビー服の呼称（コンビ肌着、プレオール等）の差異を吸収し、生年月日、現在の月齢、およびリアルタイムの外気温（北海道・北広島など）から「今着せるべき最適なベビー服の組み合わせ」を提案するツール。
フロントエンドにカレンダービューを採用し、日々の気温遷移と実際の着替え履歴、今後の推薦服をひと目で把握できるようにする。
娘の成長記録と実用性を兼ね備えつつ、技術的な探求心を満たすためのプロダクト。
将来的なリードエンジニアとしてのポートフォリオ化を見据え、BFFを介したモダンなマイクロサービスアーキテクチャに挑戦する。

### 2. 技術スタックと選定理由
バックエンド (Microservices & BFF)
言語: Go 1.26
Webフレームワーク: Gin
選定理由: プロトコルバッファを用いたRPC構成から、よりシンプルで実績のあるRESTful APIアーキテクチャへ回帰。軽量でルーティングが直感的なGinを採用し、複数サービス（気象API、推薦APIなど）を統合してカレンダーUIに最適な形でデータを返すBFF層を構築する。

フロントエンド
言語: TypeScript
フレームワーク: Next.js (App Router)
UI構成: カレンダービューを中心とし、月間・週間で日々の気温と服装履歴・予定を管理。
APIクライアント: OpenAPI Generator + SWR または React Query
選定理由: カレンダーという状態管理が複雑になりやすいUIに対し、TypeScriptの型安全性を活かす。バックエンドとの通信仕様は OpenAPI (Swagger) で定義し、クライアントコードを自動生成することで型安全な開発体験を維持する。

インフラ・開発環境
コンテナ管理: Docker / Docker Compose
API仕様管理: OpenAPI (openapi.yaml)
選定理由: proto一本化をやめ、REST APIの標準的な仕様記述であるOpenAPIを採用。各マイクロサービスの独立性を保ちつつ、Docker Composeでローカル環境を容易に構築する。

## 3. ディレクトリ構成（ポリグロット・モノレポ対応版）

フロントエンド、BFF、および複数言語（Go, Node.js）のマイクロサービス群を一つのリポジトリで安全に管理するため、`apps/` と `packages/` に分割するモダンなモノレポアーキテクチャを採用する。

baby-wear-translator/
├── apps/                         # デプロイ可能な独立したアプリケーション群
│   ├── frontend/                 # Next.js (TypeScript)
│   ├── bff/                      # BFFサービス (Go + Gin)
│   ├── weather-service/          # 気象情報サービス (Go + Gin)
│   ├── recommender-service/      # 服の推薦・履歴管理サービス (Go + Gin)
│   └── work-hours-service/       # 稼働計算・祝日判定サービス (Node.js + Express/Fastify)
│
├── packages/                     # 複数アプリで共有するスキーマや自動生成コード
│   ├── openapi/                  # OpenAPI定義ファイル (openapi.yaml 等を一元管理)
│   └── api-client-ts/            # OpenAPIから自動生成されたTS用APIクライアント
│
├── docker-compose.yml            # 全サービスの一括起動・ネットワーク定義
├── go.work                       # Goのマルチモジュール管理用（BFFやGo製サービスを束ねる）
├── package.json                  # Node.js/フロントエンドのワークスペース管理用 (pnpm等)
└── Makefile                      # コード自動生成や起動コマンドのまとめ
