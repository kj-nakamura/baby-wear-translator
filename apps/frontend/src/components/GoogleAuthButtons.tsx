'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, signOut } from 'next-auth/react';

type GoogleAuthButtonsProps = {
  callbackUrl?: string;
  imageUrl?: string | null;
  isAuthenticated: boolean;
  name?: string | null;
};

// Googleログインとログアウトの操作ボタンを表示します。
export default function GoogleAuthButtons({
  callbackUrl = '/work',
  imageUrl,
  isAuthenticated,
  name,
}: GoogleAuthButtonsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // アバターメニューの外側を押したら閉じます。
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  if (isAuthenticated) {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          title="アカウントメニュー"
          className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-sm font-black text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name ?? 'Google User'} className="h-full w-full object-cover" />
          ) : (
            <span>{(name ?? 'G').slice(0, 1).toUpperCase()}</span>
          )}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 z-20 min-w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="truncate text-sm font-black text-slate-800">{name ?? 'Google User'}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Google Account</p>
            </div>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl })}
              className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-black text-rose-600 transition hover:bg-rose-50"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void signIn('google', { callbackUrl })}
      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-slate-700"
    >
      Login
    </button>
  );
}
