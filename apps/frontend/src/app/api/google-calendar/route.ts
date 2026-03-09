import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const dynamic = 'force-dynamic';
const JST_TIME_ZONE = 'Asia/Tokyo';

type GoogleCalendarEvent = {
  id: string;
  summary: string;
  start: {
    date?: string;
    dateTime?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
  };
};

type GoogleCalendarListEntry = {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  accessRole?: string;
};

// 対象月の開始日と終了日を Google Calendar API 向けに組み立てます。
function buildMonthRange(month: string) {
  const [year, monthIndex] = month.split('-').map(Number);
  const start = `${year}-${`${monthIndex}`.padStart(2, '0')}-01T00:00:00+09:00`;
  const endYear = monthIndex === 12 ? year + 1 : year;
  const endMonth = monthIndex === 12 ? 1 : monthIndex + 1;
  const end = `${endYear}-${`${endMonth}`.padStart(2, '0')}-01T00:00:00+09:00`;

  return {
    timeMin: start,
    timeMax: end,
  };
}

// Google Calendar のイベントを画面表示しやすい形式に整形します。
function mapEvents(events: GoogleCalendarEvent[]) {
  return events.map((event) => ({
    id: event.id,
    title: event.summary || '無題の予定',
    start: event.start.dateTime ?? event.start.date ?? '',
    end: event.end?.dateTime ?? event.end?.date ?? '',
    allDay: !!event.start.date,
  }));
}

// Google Calendar 一覧を選択 UI 用の形式に整形します。
function mapCalendars(calendars: GoogleCalendarListEntry[]) {
  return calendars.map((calendar) => ({
    id: calendar.id,
    name: calendar.summary || '名称未設定のカレンダー',
    color: calendar.backgroundColor ?? '#0ea5e9',
    isPrimary: !!calendar.primary,
    accessRole: calendar.accessRole ?? 'reader',
  }));
}

// ログイン済みユーザーの Google カレンダー一覧または予定を返します。
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const month = request.nextUrl.searchParams.get('month');
  const mode = request.nextUrl.searchParams.get('mode');
  const calendarId = request.nextUrl.searchParams.get('calendarId') ?? 'primary';

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Googleログインが必要です' }, { status: 401 });
  }

  if (mode === 'calendars') {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const details = await response.text();
        return NextResponse.json(
          { error: 'Googleカレンダー一覧の取得に失敗しました', details },
          { status: response.status }
        );
      }

      const data = await response.json() as { items?: GoogleCalendarListEntry[] };
      return NextResponse.json({ calendars: mapCalendars(data.items ?? []) });
    } catch (error) {
      return NextResponse.json(
        { error: 'Googleカレンダー一覧の取得中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  }

  if (!month) {
    return NextResponse.json({ error: '対象月が指定されていません' }, { status: 400 });
  }

  const { timeMin, timeMax } = buildMonthRange(month);
  const targetUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  targetUrl.searchParams.set('singleEvents', 'true');
  targetUrl.searchParams.set('orderBy', 'startTime');
  targetUrl.searchParams.set('timeMin', timeMin);
  targetUrl.searchParams.set('timeMax', timeMax);
  targetUrl.searchParams.set('timeZone', JST_TIME_ZONE);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { error: 'Googleカレンダーの取得に失敗しました', details },
        { status: response.status }
      );
    }

    const data = await response.json() as { items?: GoogleCalendarEvent[] };
    return NextResponse.json({ events: mapEvents(data.items ?? []) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Googleカレンダー連携でエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
