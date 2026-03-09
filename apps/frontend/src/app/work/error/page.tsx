import Link from 'next/link';

type ErrorPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'Googleログインが拒否されました。アクセス権限を確認してください。',
  CallbackRouteError: 'Googleからの認証結果を処理できませんでした。時間をおいて再度お試しください。',
  Configuration: 'Googleログインの設定に不備があります。環境変数を確認してください。',
  Default: 'ログイン処理でエラーが発生しました。時間をおいて再度お試しください。',
  OAuthAccountNotLinked: 'このメールアドレスは別のログイン方法ですでに利用されています。',
  OAuthCallbackError: 'Google認証のコールバック処理に失敗しました。再度ログインしてください。',
  OAuthSignin: 'Googleログインの開始に失敗しました。設定またはネットワーク状態を確認してください。',
  SignOutError: 'ログアウトに失敗しました。ページを再読み込みして再度お試しください。',
  Unknown: '予期しないエラーが発生しました。時間をおいて再度お試しください。',
};

// 認証エラーコードを日本語メッセージへ変換します。
function resolveAuthErrorMessage(errorCode?: string) {
  if (!errorCode) {
    return ERROR_MESSAGES.Default;
  }

  return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;
}

// 認証エラー画面を表示し、ユーザーに再試行導線を提供します。
export default async function WorkAuthErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const errorCode = params?.error;
  const message = resolveAuthErrorMessage(errorCode);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_45%,#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-500">認証エラー</p>
        <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Googleログインを完了できませんでした</h1>
        <p className="mt-4 text-sm font-bold leading-7 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/work"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700"
          >
            Workに戻る
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Homeに戻る
          </Link>
        </div>
        {errorCode && (
          <p className="mt-5 text-xs font-bold text-slate-400">
            エラーコード: {errorCode}
          </p>
        )}
      </div>
    </div>
  );
}
