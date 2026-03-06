# Work Hours Service

## 概要

`work-hours-service` は、日本のカレンダーおよび一般的な商習慣に基づいた**営業日・稼働時間の算出を統一的に行うためのユーティリティサービス**です。

土日や祝日に加え、日本国内で一般的に休日となる**「年末年始（12月29日 〜 1月3日）」を考慮した計算ロジック**を備えており、システム全体で一貫した休日判定や稼働実績の集計を可能にします。

## 役割と責務

このサービスは **バックエンド専用のマイクロサービス** です。

- **Backend (this service)**: 休日判定、稼働時間計算のロジック、祝日データの取得・キャッシュ。
- **Frontend (`apps/frontend/`)**: 稼働時間の計算シミュレーター、祝日カレンダー表示の UI ページを担当。

`apps/frontend/` 側の `/work-hours` ページから本 API を呼び出して使用します。

## 技術スタック

- **Runtime**: Node.js
- **Framework**: Express (Node.js)
- **Language**: TypeScript
- **Dependencies**:
  - `axios`: 外部祝日 API (holidays-jp.github.io) へのアクセス用
  - `date-fns`: 日付操作の標準ライブラリ
  - `node-cache`: 祝日データのメモリ内キャッシュ用

## 主要機能とロジック

### 1. 稼働時間の計算 (`WORKING_HOURS`)
- **判定条件**: 
  - 土日 (Sat/Sun) を除外。
  - 日本の祝日（外部APIより取得）を除外。
  - 年末年始（12月29日 〜 1月3日）を除外。
- **計算方法**: `有効な稼働日数 × 8時間` を返却。

### 2. 祝日リストの取得 (`GET_HOLIDAYS_LIST`)
- 指定期間内の「日本の祝日」および「年末年始」の日付を抽出。
- `1/1`, `1/2` ... のような形式のリストまたはカンマ区切り文字列で返却。

## API エンドポイント

| メソッド | パス | 説明 | リクエスト例 |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/work-hours` | 指定月または指定期間の稼働時間を計算 | `{ "month": "2026-03" }` |
| `GET` | `/api/v1/holidays` | 指定期間の祝日リストを取得 | `?start=2026-03-01&end=2026-03-31` |

## ディレクトリ構成

```text
work-hours-service/
├── src/
│   ├── index.ts              # エントリーポイント (Express Server)
│   ├── handlers/             # リクエストハンドラ (Router)
│   ├── services/             # 祝日取得、計算のコアロジック
│   └── types/                # 型定義
├── .gitignore
├── Dockerfile                # コンテナ定義
├── package.json
└── tsconfig.json
```

## 祝日データの取得元

日本の祝日データは [Holidays JP API](https://holidays-jp.github.io/) を使用します。
API負荷軽減とパフォーマンス向上のため、以下のキャッシュ戦略を採用しています。

- 通常キャッシュ: 6時間（21,600秒）
- stale キャッシュ: 30日
- 同時アクセス時のリクエスト集約: 祝日データ取得中は同じ Promise を再利用
