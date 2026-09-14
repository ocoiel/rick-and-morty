import { useQueryClient } from '@tanstack/react-query';
import { render as rtlRender, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Providers } from '@/components/providers';

function CacheProbe() {
  const client = useQueryClient();
  const { staleTime, refetchOnWindowFocus } = client.getDefaultOptions().queries ?? {};

  return (
    <dl>
      <dd data-testid="stale-time">{String(staleTime)}</dd>
      <dd data-testid="refetch-focus">{String(refetchOnWindowFocus)}</dd>
    </dl>
  );
}

describe('Providers', () => {
  it('disponibiliza o cliente de consultas para a árvore', () => {
    rtlRender(
      <Providers>
        <CacheProbe />
      </Providers>,
    );

    expect(screen.getByTestId('stale-time')).toHaveTextContent('Infinity');
  });

  it('não revalida ao voltar o foco, já que os dados da origem são imutáveis', () => {
    rtlRender(
      <Providers>
        <CacheProbe />
      </Providers>,
    );

    expect(screen.getByTestId('refetch-focus')).toHaveTextContent('false');
  });
});
