'use client';

import Link from 'next/link';

const destinations = [
  {
    href: '/baby',
    emoji: '🍼',
    eyebrow: 'Baby',
    title: '赤ちゃんの衣替え',
    description: '生年月日から成長マイルストーンとベビー服の目安を確認します。',
    accent: 'from-sky-500 to-indigo-500',
  },
  {
    href: '/work',
    emoji: '📅',
    eyebrow: 'Work',
    title: '稼働時間計算',
    description: '祝日と有給日を考慮して、その月の稼働時間を計算します。',
    accent: 'from-emerald-500 to-teal-500',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef6ff,transparent_45%),linear-gradient(180deg,#f8fbff_0%,#ffffff_55%,#f5fbf8_100%)] px-4 py-10 text-gray-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Baby Wear Translator</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            機能ごとに
            <br />
            入口を分けました。
          </h1>
          <p className="mt-4 text-sm font-medium leading-7 text-slate-500 sm:text-base">
            ベビー服の確認は <span className="font-black text-slate-700">/baby</span>、稼働時間の計算は
            <span className="font-black text-slate-700"> /work</span> から使えます。
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {destinations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_-30px_rgba(15,23,42,0.45)]"
            >
              <div className={`inline-flex rounded-full bg-gradient-to-r ${item.accent} px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white`}>
                {item.eyebrow}
              </div>
              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{item.title}</h2>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{item.description}</p>
                </div>
                <span className="text-4xl transition duration-300 group-hover:scale-110">{item.emoji}</span>
              </div>
              <p className="mt-8 text-sm font-black text-slate-700">
                開く
                <span className="ml-2 inline-block transition duration-300 group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
