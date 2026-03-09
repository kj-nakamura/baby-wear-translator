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
            <GoogleAuthButtons
              callbackUrl={callbackUrl}
              imageUrl={session?.user?.image}
              isAuthenticated={!!session?.accessToken}
              name={session?.user?.name}
            />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <section className="relative">
          <div className="absolute -top-4 left-0 select-none text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 sm:-top-6 sm:-left-2 sm:text-xs sm:tracking-widest">
            Work
          </div>
          <WorkHoursSection isGoogleConnected={!!session?.accessToken} />
        </section>
      </main>
    </div>
  );
}
