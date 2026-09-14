import { NextResponse } from 'next/server';
import { DomainError, InvalidEpisodeNumberError } from '@zrp/core';
import { container } from '@/lib/container';

const CACHE_CONTROL = 'public, max-age=86400, stale-while-revalidate=86400';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const payload = await container.getCharacterAppearances.execute({ characterId: id });

    return NextResponse.json(payload, { headers: { 'cache-control': CACHE_CONTROL } });
  } catch (error) {
    if (error instanceof InvalidEpisodeNumberError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 400 },
      );
    }

    if (error instanceof DomainError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno inesperado.' } },
      { status: 500 },
    );
  }
}
