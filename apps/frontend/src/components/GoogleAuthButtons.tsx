'use client';

import { signIn, signOut } from 'next-auth/react';

type GoogleAuthButtonsProps = {
  callbackUrl?: string;
  isAuthenticated: boolean;
};

// Googleログインとログアウトの操作ボタンを表示します。
export default function GoogleAuthButtons({ callbackUrl = '/work', isAuthenticated }: GoogleAuthButtonsProps) {
  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl })}
        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      >
        ログアウト
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void signIn('google', { callbackUrl })}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700 sm:w-auto"
    >
      Googleでログイン
    </button>
  );
}
