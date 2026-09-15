import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EpisodeToolbar } from '@/components/episode-toolbar';
import { render, screen } from './render';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

describe('EpisodeToolbar', () => {
  it('liga as setas aos episódios vizinhos', () => {
    render(<EpisodeToolbar current={10} total={51} />);

    expect(screen.getByTestId('nav-previous')).toHaveAttribute('href', '/episode/9');
    expect(screen.getByTestId('nav-next')).toHaveAttribute('href', '/episode/11');
  });

  it('desabilita a seta anterior no primeiro episódio', () => {
    render(<EpisodeToolbar current={1} total={51} />);

    expect(screen.queryByTestId('nav-previous')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/episódio anterior/iu)).toHaveAttribute('aria-disabled', 'true');
  });

  it('desabilita a seta seguinte no último episódio', () => {
    render(<EpisodeToolbar current={51} total={51} />);

    expect(screen.queryByTestId('nav-next')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/próximo episódio/iu)).toHaveAttribute('aria-disabled', 'true');
  });

  it('mostra o episódio atual no campo', () => {
    render(<EpisodeToolbar current={28} total={51} />);

    expect(screen.getByLabelText(/número do episódio/iu)).toHaveValue(28);
  });

  it('pula para o episódio digitado com Enter', async () => {
    const user = userEvent.setup();
    render(<EpisodeToolbar current={1} total={51} />);

    const input = screen.getByLabelText(/número do episódio/iu);
    await user.clear(input);
    await user.type(input, '42{Enter}');

    expect(push).toHaveBeenCalledWith('/episode/42');
  });

  it('ignora número fora do catálogo e volta ao atual', async () => {
    const user = userEvent.setup();
    render(<EpisodeToolbar current={7} total={51} />);

    const input = screen.getByLabelText(/número do episódio/iu);
    await user.clear(input);
    await user.type(input, '999{Enter}');

    expect(push).not.toHaveBeenCalled();
    expect(input).toHaveValue(7);
  });

  it('não navega quando o número digitado é o episódio atual', async () => {
    const user = userEvent.setup();
    render(<EpisodeToolbar current={7} total={51} />);

    const input = screen.getByLabelText(/número do episódio/iu);
    await user.clear(input);
    await user.type(input, '7{Enter}');

    expect(push).not.toHaveBeenCalled();
  });

  it('também pula ao sair do campo', async () => {
    const user = userEvent.setup();
    render(<EpisodeToolbar current={3} total={51} />);

    const input = screen.getByLabelText(/número do episódio/iu);
    await user.clear(input);
    await user.type(input, '9');
    await user.tab();

    expect(push).toHaveBeenCalledWith('/episode/9');
  });
});
