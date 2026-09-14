import { NextResponse } from 'next/server';
import { TOTAL_EPISODES } from '@/lib/episode-catalog';

import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/episode/:path*',
};

const EPISODE_PATH = /^\/episode\/([^/]+)\/?$/u;

export function proxy(request: NextRequest): NextResponse {
  const match = EPISODE_PATH.exec(request.nextUrl.pathname);

  if (!match) return NextResponse.next();

  const raw = decodeURIComponent(match[1] ?? '');
  const parsed = Number(raw);

  const isKnownEpisode =
    raw.trim() !== '' &&
    Number.isSafeInteger(parsed) &&
    parsed >= 1 &&
    parsed <= TOTAL_EPISODES &&
    String(parsed) === raw.trim();

  if (isKnownEpisode) return NextResponse.next();

  return NextResponse.rewrite(new URL('/episode-nao-encontrado', request.url));
}
