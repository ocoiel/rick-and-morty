import { NextResponse } from 'next/server';
import {
  DomainError,
  EpisodeNotFoundError,
  InvalidEpisodeNumberError,
  PUBLIC_DAY_CACHE_CONTROL,
} from '@zrp/core';
import { container } from '@/lib/container';

function statusFor(error: DomainError): number {
  if (error instanceof InvalidEpisodeNumberError) return 400;
  if (error instanceof EpisodeNotFoundError) return 404;
  return 502;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const payload = await container.getEpisodeCast.execute({ episode: id });

    return NextResponse.json(payload, {
      headers: { 'cache-control': PUBLIC_DAY_CACHE_CONTROL, 'x-cache-source': payload.meta.source },
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: statusFor(error) },
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno inesperado.' } },
      { status: 500 },
    );
  }
}
