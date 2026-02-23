## プロジェクト概要

1. プロジェクト定義
名称
Baby Wear Translator

コンセプト
ショップごとに異なるベビー服の呼称（コンビ肌着、プレオール等）の差異を吸収し、生年月日、現在の月齢、およびリアルタイムの外気温から「今着せるべき最適なベビー服の組み合わせ」を提案するツール。
娘の成長記録と実用性を兼ね備えつつ、技術的な遊び心を盛り込んだプロダクト。

2. 技術スタックと選定理由
バックエンド
言語: Go 1.26

フレームワーク: Gin

選定理由: Laravelのような決められたディレクトリ構造の強制はないが、JSONのバインディング、CORS設定、バリデーションといったAPI開発における泥臭い定型処理を劇的に削減できるため。一人での開発スピードと生産性を最大化する。また、Go 1.26の最新機能も積極的に活用する。

フロントエンド
言語: TypeScript

フレームワーク: Next.js (App Router)

API連携（スキーマ駆動開発）
仕様定義: OpenAPI (openapi.yaml)

ツール: oapi-codegen (Go側), openapi-typescript (TS側)

選定理由: openapi.yamlを単一の真実の情報源とし、バックエンドのルーティング・構造体と、フロントエンドの型定義を自動生成する。型不一致によるバグを物理的に排除し、モノレポ構成での開発体験を極限まで高める。

3. ディレクトリ構成
フロントエンドとバックエンドを一つのリポジトリで管理するモノレポ構成を採用。Go側は標準的なレイヤードアーキテクチャを意識した間取りとする。

baby-wear-translator/
├── backend/
│   ├── cmd/api/main.go       # エントリーポイント
│   ├── internal/handler/     # APIのルーティングとHTTPリクエスト/レスポンス処理 (Gin)
│   ├── internal/domain/      # 服の名称マッピングや季節判定のビジネスロジック
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/app/              # Next.js 画面コンポーネント
│   ├── src/types/            # OpenAPIから自動生成された型定義
│   ├── package.json
│   └── tsconfig.json
└── openapi.yaml              # API設計図（スキーマ）

4. 直近のアクションアイテム
[x] openapi.yaml のひな形作成（生年月日・気温を受け取り、服のリストを返す定義）

[ ] backend側の oapi-codegen によるインターフェース自動生成の実行

[ ] 各ショップ（西松屋、アカチャンホンポ、ユニクロ等）のベビー服名称マスターデータの構築






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

ステップ5: ベビー服のマスターデータ（インメモリ）の作成

「internal/domain/master.go を作成して。コンビ肌着、カバーオール、ロンパースなどの汎用名に対し、西松屋、ユニクロ、アカチャンホンポでの独自の呼び名（shop_specific_name）をマッピングしたGoのMapデータを定義して」

ステップ6: 月齢計算ロジックの実装

「internal/domain/age.go を作成して。生年月日（time.Time）と現在の日付から、正確な『生後◯ヶ月』を算出するGoの関数を書いて」

ステップ7: 季節・気温に基づく服の判定アルゴリズム

「internal/domain/recommender.go を作成して。月齢（例: 4ヶ月）と外気温（例: 氷点下〜5度）を引数に取り、マスターデータから適切な服の組み合わせ（インナー、ミドル、アウター）の universal_name の配列を返す関数を実装して」

Phase 4: バックエンド（Go）のAPI完成
作成したロジックを、自動生成されたGinのインターフェースに繋ぎ込みます。

ステップ8: ハンドラーの実装

「internal/handler/recommend.go を作成して。oapi-codegenで生成されたサーバーインターフェースを満たす構造体を実装し、リクエストパラメータを受け取ってdomainの関数を呼び出し、JSONで返す処理を書いて」

ステップ9: main.goとCORSの設定

「cmd/api/main.go を作成して。Ginのルーターを立ち上げ、CORSミドルウェア（localhost:3000を許可）を設定し、先ほどのハンドラーを登録してポート8080で起動するコードを書いて」

ステップ10: 動作確認（curl）
ローカルでGoサーバーを立ち上げ、10月生まれ・現在気温マイナス2度・西松屋を指定したcurlコマンドで、正しいJSONが返ってくるか確認します。

Phase 5: フロントエンド（Next.js）の実装
APIが完成したら、TypeScriptで画面を作ります。

ステップ11: APIクライアントの作成

「frontend側で、openapi-typescriptで生成された型を利用して、GoのAPI（http://localhost:8080/recommend）を叩くための安全なフェッチ関数（カスタムフックなど）を作成して」

ステップ12: 入力フォームコンポーネントの作成

「赤ちゃんの生年月日（カレンダー入力）、現在の気温（数値入力）、ショップ名（セレクトボックス）を入力できるReactコンポーネントをTailwind CSSを使って実装して」

ステップ13: 結果表示コンポーネントの作成

「APIから返ってきた服のリスト（universal_name と shop_specific_name）を、わかりやすいカードUIで表示するReactコンポーネントをTailwind CSSで作って」

ステップ14: メインページの結合

「app/page.tsxで、入力フォームと結果表示コンポーネントを繋ぎ合わせ、状態管理（useState等）を行って画面を完成させて」

Phase 6: 実用性の向上（北広島の気温自動取得）
ステップ15: 気象APIとの連携（Go側）

「現在の気温を手動入力ではなく、Open-Meteoなどの無料気象APIを使って、北海道北広島市の現在の気温をGo側で自動取得するように、internal/domain のロジックを拡張して」