import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const birthDate = searchParams.get('birth_date');

    if (!birthDate) {
        return NextResponse.json({ error: 'birth_date is required' }, { status: 400 });
    }

    const backendUrl = (process.env.BACKEND_API_URL || 'http://0.0.0.0:8080').replace(/\/$/, '');
    const targetUrl = `${backendUrl}/milestones?birth_date=${birthDate}`;

    console.log(`[Proxy] Target: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            },
            // リダイレクトを追跡しないように設定（デバッグのため）
            redirect: 'manual',
        });

        // 手動リダイレクトの場合の処理
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            console.warn(`[Proxy] Backend returned redirect to: ${location}`);
            return NextResponse.json(
                { error: `Backend redirected to ${location}` },
                { status: 502 }
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Backend error: ${response.status} ${errorText}`);
            return NextResponse.json(
                { error: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Proxy] Critical error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error during proxying',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
