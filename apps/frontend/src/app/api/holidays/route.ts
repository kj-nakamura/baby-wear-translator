import { existsSync } from 'node:fs';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const resolveWorkHoursBackendUrl = () => {
    if (process.env.WORK_HOURS_API_URL) {
        return process.env.WORK_HOURS_API_URL.replace(/\/$/, '');
    }

    return existsSync('/.dockerenv')
        ? 'http://work-hours:8081'
        : 'http://localhost:8081';
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!month && (!start || !end)) {
        return NextResponse.json({ error: 'month or start and end are required' }, { status: 400 });
    }

    const backendUrl = resolveWorkHoursBackendUrl();
    const targetUrl = month
        ? `${backendUrl}/api/v1/holidays?month=${encodeURIComponent(month)}`
        : `${backendUrl}/api/v1/holidays?start=${start}&end=${end}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Backend error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
