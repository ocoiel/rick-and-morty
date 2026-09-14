import { describe, expect, it } from 'vitest';
import { StatusBadge } from '@/components/status-badge';
import { render, screen } from './render';

describe('StatusBadge', () => {
  it('recai para desconhecido quando a origem envia um status fora do vocabulário', () => {
    render(<StatusBadge status={'Zumbi' as never} />);

    expect(screen.getByText('Desconhecido')).toBeInTheDocument();
  });

  it.each([
    ['Alive', 'Vivo'],
    ['Dead', 'Morto'],
    ['unknown', 'Desconhecido'],
  ] as const)('traduz o status %s para %s', (status, label) => {
    render(<StatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
