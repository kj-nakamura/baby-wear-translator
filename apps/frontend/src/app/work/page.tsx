import Link from 'next/link';
import { getServerSession } from 'next-auth';
import WorkHoursSection from '@/components/WorkHoursSection';
import GoogleAuthButtons from '@/components/GoogleAuthButtons';
import { authOptions } from '@/auth';

type WorkPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

// Workページの表示内容をセッション状態に応じて切り替えます。
export default async function WorkPage({ searchParams }: WorkPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ?? '/work';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3fbf7_0%,#f8fffc_35%,#ffffff_100%)]">
      <header className="sticky top-0 z-10 w-full border-b border-emerald-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-3xl">📅</span>
            <div className="min-w-0">
              <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-lg font-black leading-tight text-transparent sm:text-xl">
                稼働時間計算
              </h1>
              <p className="text-[11px] font-bold text-gray-400 sm:text-xs">祝日と有給日を考慮したワークカレンダー</p>
            </div>
          </div>
          <nav className="flex items-center gap-3 self-end text-[11px] font-black uppercase tracking-[0.16em] text-gray-400 sm:self-auto sm:text-xs sm:tracking-[0.2em]">
            <Link href="/" className="transition hover:text-gray-700">Home</Link>
            <Link href="/baby" className="transition hover:text-emerald-600">Baby</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <section className="relative">
          <div className="absolute -top-4 left-0 select-none text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 sm:-top-6 sm:-left-2 sm:text-xs sm:tracking-widest">
            Work
          </div>
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-gray-100 bg-white/70 p-6 shadow-sm backdrop-blur-md sm:p-8">
              <div className="rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.95)_0%,rgba(239,246,255,0.9)_100%)] p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-500">Google Calendar Sync</p>
                {!session?.user ? (
                  <>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                      稼働時間計算はそのまま使えます
                      <br />
                      Googleログインは任意です
                    </h2>
                    <p className="mt-4 text-sm font-bold leading-7 text-slate-600">
                      下の稼働時間計算カレンダーはログインなしで利用できます。
                      Googleカレンダー連携を追加するときだけ、Googleアカウントでログインしてください。
                    </p>
                    <div className="mt-6">
                      <GoogleAuthButtons callbackUrl={callbackUrl} isAuthenticated={false} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                        Googleアカウントでログイン中
                      </h2>
                      <p className="mt-4 truncate text-sm font-bold text-slate-700">
                        {session.user.name ?? 'Google User'}
                      </p>
                      <p className="truncate text-xs font-bold text-slate-400">
                        {session.user.email}
                      </p>
                    </div>
                    <GoogleAuthButtons isAuthenticated />
                  </div>
                )}
              </div>
            </div>
            <WorkHoursSection />
          </div>
        </section>
      </main>
    </div>
  );
}
