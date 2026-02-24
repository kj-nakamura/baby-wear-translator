## プロジェクト概要

1. プロジェクト定義
名称
Baby Wear Translator

コンセプト
ショップごとに異なるベビー服の呼称（コンビ肌着、プレオール等）の差異を吸収し、生年月日、現在の月齢、およびリアルタイムの外気温（北海道・北広島など）から「今着せるべき最適なベビー服の組み合わせ」を提案するツール。
娘の成長記録と実用性を兼ね備えつつ、技術的な探求心を満たすためのプロダクト。
将来的なリードエンジニアとしてのポートフォリオ化を見据え、あえてモダンなマイクロサービスアーキテクチャに挑戦する。

2. 技術スタックと選定理由
バックエンド (API Gateway & Microservices)
言語: Go 1.26

フレームワーク: Gin (API Gateway用)

サービス間通信: gRPC / Protocol Buffers

選定理由: Goの強みである高速なネットワーク通信と並行処理をフルに活かし、拡張性の高い分散システムを構築するため。

フロントエンド
言語: TypeScript

フレームワーク: Next.js (App Router)

インフラ・開発環境
コンテナ管理: Docker / Docker Compose

スキーマ駆動開発: OpenAPI (フロント・ゲートウェイ間) および Protocol Buffers (バックエンド・サービス間)

選定理由: モノレポ環境下で、フロントエンド、APIゲートウェイ、および複数に分割されたGoの裏側サービス群を、コマンド一発で一括起動し、開発体験（DX）を最大化するため。

3. ディレクトリ構成
フロントエンドと、細分化されたバックエンドサービス群を一つのリポジトリで管理し、スキーマ定義を一元化するモノレポ構成。

baby-wear-translator/
├── proto/                   # gRPCの設計図 (.protoファイル群)
│   └── weather/v1/weather.proto
├── frontend/                # Next.js (TypeScript)
├── backend/
│   ├── api-gateway/         # フロントからのHTTP(JSON)を受け、gRPCへ変換する門番 (Gin)
│   └── services/
│       ├── weather/         # 気象APIから情報を取得して返すサービス (Go + gRPC)
│       └── master/          # 服の名称辞書や判定ロジックを管理するサービス (Go + gRPC)
├── docker-compose.yml       # 全サービスの一括起動コンテナ設定
├── openapi.yaml             # フロントエンドとAPI Gateway間のAPI設計図
└── Makefile                 # コード自動生成(oapi-codegen, protoc)や起動コマンドのまとめ

4. 直近のアクションアイテム
[x] モノレポのルートディレクトリ構築と Makefile の初期設定

[ ] gRPC通信の土台となる weather.proto ファイルの作成

[x] 全サービス（Frontend, API Gateway, Weather Service等）を連携して立ち上げる docker-compose.yml の作成と起動確認






## 作業手順

Phase 1: プロジェクト基盤とAPI設計（スキーマ駆動の要）
ここがすべての土台になります。まずは仕様をAIと共有します。

ステップ1: ディレクトリとパッケージの初期化
「Go 1.26とNext.jsのモノレポ構成の初期化コマンドを出力して。バックエンドはGinを使用し、ルートにopenapi.yamlを配置する構成にして」

ステップ2: openapi.yamlの作成（リクエスト/レスポンス定義）
「openapi.yamlを作成して。エンドポイントは GET /recommend。
リクエストパラメータ: birth_date (YYYY-MM-DD), target_shop (string, 例: uniqlo), current_temp (number, 気温)。
レスポンス: age_in_months (integer), items (配列。プロパティは universal_name と shop_specific_name)」

Phase 2: 型とインターフェースの自動生成
書いた設計図をもとに、GoとTSのコードを生成します。ここは手動（コマンド実行）でもGeminicli経由でもOKです。

ステップ3: Go側のコード生成（oapi-codegen） [x]
「oapi-codegenを使って、先ほどのopenapi.yamlから、Gin用のサーバーインターフェースと構造体（型）を生成するコマンドと設定（cfg.yamlなどが必要ならそれも）を教えて」

ステップ4: TypeScript側のコード生成
「openapi-typescriptを使って、openapi.yamlからNext.js（frontend/src/types）へ型定義ファイルを出力するnpmコマンドを教えて」

Phase 3: バックエンド（Go）のドメインロジック実装
ここからGoのコードを書いていきます。フレームワーク（Gin）にはまだ触れず、純粋なGoのロジックを作ります。

ステップ5: ベビー服のマスターデータ（インメモリ）の作成 [x]
「internal/domain/master.go を作成して。コンビ肌着、カバーオール、ロンパースなどの汎用名に対し、西松屋、ユニクロ、アカチャンホンポでの独自の呼び名（shop_specific_name）をマッピングしたGoのMapデータを定義して」

ステップ6: 月齢計算ロジックの実装 [x]
「internal/domain/age.go を作成して。生年月日（time.Time）と現在の日付から、正確な『生後◯ヶ月』を算出するGoの関数を書いて」

ステップ7: 季節・気温に基づく服の判定アルゴリズム [x]
「internal/domain/recommender.go を作成して。月齢（例: 4ヶ月）と外気温（例: 氷点下〜5度）を引数に取り、マスターデータから適切な服の組み合わせ（インナー、ミドル、アウター）の universal_name の配列を返す関数を実装して」

Phase 4: バックエンド（Go）のAPI完成
作成したロジックを、自動生成されたGinのインターフェースに繋ぎ込みます。

ステップ8: ハンドラーの実装 [x]
「internal/handler/recommend.go を作成して。oapi-codegenで生成されたサーバーインターフェースを満たす構造体を実装し、リクエストパラメータを受け取ってdomainの関数を呼び出し、JSONで返す処理を書いて」

ステップ9: main.goとCORSの設定 [x]
「cmd/api/main.go を作成して。Ginのルーターを立ち上げ、CORSミドルウェア（localhost:3000を許可）を設定し、先ほどのハンドラーを登録してポート8080で起動するコードを書いて」

ステップ10: 動作確認（curl） [x]
ローカルでGoサーバーを立ち上げ、10月生まれ・現在気温マイナス2度・西松屋を指定したcurlコマンドで、正しいJSONが返ってくるか確認します。

Phase 5: フロントエンド（Next.js）の実装
APIが完成したら、TypeScriptで画面を作ります。

ステップ11: APIクライアントの作成 [x]
「frontend側で、openapi-typescriptで生成された型を利用して、GoのAPI（http://localhost:8080/recommend）を叩くための安全なフェッチ関数（カスタムフックなど）を作成して」

ステップ12: 入力フォームコンポーネントの作成 [x]
「赤ちゃんの生年月日（カレンダー入力）、現在の気温（数値入力）、ショップ名（セレクトボックス）を入力できるReactコンポーネントをTailwind CSSを使って実装して」

ステップ13: 結果表示コンポーネントの作成 [x]

「APIから返ってきた服のリスト（universal_name と shop_specific_name）を、わかりやすいカードUIで表示するReactコンポーネントをTailwind CSSで作って」

ステップ14: メインページの結合 [x]

「app/page.tsxで、入力フォームと結果表示コンポーネントを繋ぎ合わせ、状態管理（useState等）を行って画面を完成させて」