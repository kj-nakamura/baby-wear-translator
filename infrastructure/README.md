# Infrastructure

GCP 上に各サービスをデプロイするための Pulumi 定義です。

## 前提

- Node.js
- Pulumi CLI
- GCP プロジェクト
- GCP 認証設定

## 必須設定

このスタックでは最低限、以下の Pulumi config が必要です。

- `gcp:project`
- `baby-wear-translator:authSecret`
- `baby-wear-translator:authGoogleId`
- `baby-wear-translator:authGoogleSecret`
- `baby-wear-translator:frontendBaseUrl`

`frontendBaseUrl` は Google OAuth のコールバック URL を正しく組み立てるために必須です。  
dev 環境でも実際にアクセスされるフロントエンドの公開 URL を入れてください。

```bash
pulumi config set gcp:project YOUR_GCP_PROJECT_ID
pulumi config set --secret baby-wear-translator:authSecret YOUR_AUTH_SECRET
pulumi config set --secret baby-wear-translator:authGoogleId YOUR_GOOGLE_CLIENT_ID
pulumi config set --secret baby-wear-translator:authGoogleSecret YOUR_GOOGLE_CLIENT_SECRET
pulumi config set baby-wear-translator:frontendBaseUrl https://YOUR_FRONTEND_HOST
```

例:

```bash
pulumi config set baby-wear-translator:frontendBaseUrl https://baby-wear-frontend-xxxxx-an.a.run.app
```

## デプロイ

```bash
npm install
pulumi up
```

## メモ

`frontendBaseUrl` は Cloud Run の `AUTH_URL` と `NEXTAUTH_URL` に注入されます。  
これが未設定だと、Google ログイン後の遷移先が `localhost` ベースで解決されることがあります。
