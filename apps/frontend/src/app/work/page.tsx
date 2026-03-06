'use client';

import Link from 'next/link';
import WorkHoursSection from '@/components/WorkHoursSection';

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3fbf7_0%,#f8fffc_35%,#ffffff_100%)]">
      <header className="sticky top-0 z-10 w-full border-b border-emerald-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-black leading-tight text-transparent">
                稼働時間計算
              </h1>
              <p className="text-xs font-bold text-gray-400">祝日と有給日を考慮したワークカレンダー</p>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
            <Link href="/" className="transition hover:text-gray-700">Home</Link>
            <Link href="/baby" className="transition hover:text-emerald-600">Baby</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <section className="relative">
          <div className="absolute -top-6 -left-2 select-none text-xs font-black uppercase tracking-widest text-emerald-200">
            Work
          </div>
          <WorkHoursSection />
        </section>
      </main>
    </div>
  );
}
