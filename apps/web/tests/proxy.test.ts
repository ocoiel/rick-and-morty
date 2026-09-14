import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { TOTAL_EPISODES } from '@/lib/episode-catalog';
import { proxy } from '@/proxy';

function requestFor(path: string): NextRequest {
  return new NextRequest(new URL(path, 'https://exemplo.test'));
}

const rewriteTarget = (response: ReturnType<typeof proxy>) =>
  response.headers.get('x-middleware-rewrite');

describe('proxy de episódios', () => {
  it.each([1, 2, TOTAL_EPISODES])('deixa passar o episódio %s', (episode) => {
    const response = proxy(requestFor(`/episode/${episode}`));

    expect(rewriteTarget(response)).toBeNull();
  });

  it.each([
    ['acima do catálogo', String(TOTAL_EPISODES + 1)],
    ['zero', '0'],
    ['negativo', '-3'],
    ['decimal', '1.5'],
    ['texto', 'abc'],
    ['vazio', ' '],
    ['com zero à esquerda', '007'],
    ['notação científica', '1e2'],
  ])('bloqueia episódio %s', (_label, episode) => {
    const response = proxy(requestFor(`/episode/${encodeURIComponent(episode)}`));

    expect(rewriteTarget(response)).toContain('/episode-nao-encontrado');
  });

  it('ignora caminhos fora do padrão de episódio', () => {
    const response = proxy(requestFor('/episode/1/extra'));

    expect(rewriteTarget(response)).toBeNull();
  });

  it('aceita barra final', () => {
    const response = proxy(requestFor('/episode/5/'));

    expect(rewriteTarget(response)).toBeNull();
  });
});
