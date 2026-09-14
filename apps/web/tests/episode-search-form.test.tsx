import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EpisodeSearchForm } from '@/components/episode-search-form';
import { render, screen } from './render';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

describe('EpisodeSearchForm', () => {
  it('navega para o episódio informado', async () => {
    const user = userEvent.setup();
    render(<EpisodeSearchForm totalEpisodes={51} />);

    await user.type(screen.getByLabelText(/número do episódio/iu), '7');
    await user.click(screen.getByRole('button', { name: /ver elenco/iu }));

    expect(push).toHaveBeenCalledWith('/episode/7');
  });

  it('permite enviar com a tecla Enter', async () => {
    const user = userEvent.setup();
    render(<EpisodeSearchForm totalEpisodes={51} />);

    await user.type(screen.getByLabelText(/número do episódio/iu), '12{Enter}');

    expect(push).toHaveBeenCalledWith('/episode/12');
  });

  it.each([
    ['vazio', ''],
    ['zero', '0'],
    ['negativo', '-3'],
    ['acima do catálogo', '52'],
  ])('bloqueia envio com valor %s e explica o motivo', async (_label, value) => {
    const user = userEvent.setup();
    render(<EpisodeSearchForm totalEpisodes={51} />);

    if (value !== '') {
      await user.type(screen.getByLabelText(/número do episódio/iu), value);
    }
    await user.click(screen.getByRole('button', { name: /ver elenco/iu }));

    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('entre 1 e 51');
  });

  it('marca o campo como inválido para leitores de tela', async () => {
    const user = userEvent.setup();
    render(<EpisodeSearchForm totalEpisodes={51} />);

    const input = screen.getByLabelText(/número do episódio/iu);
    await user.type(input, '99');
    await user.click(screen.getByRole('button', { name: /ver elenco/iu }));

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('limpa o erro assim que o usuário corrige o valor', async () => {
    const user = userEvent.setup();
    render(<EpisodeSearchForm totalEpisodes={51} />);

    const input = screen.getByLabelText(/número do episódio/iu);
    await user.type(input, '99');
    await user.click(screen.getByRole('button', { name: /ver elenco/iu }));
    expect(screen.getByRole('alert')).toHaveTextContent('entre 1 e 51');

    await user.clear(input);
    await user.type(input, '5');

    expect(screen.getByRole('alert')).toHaveTextContent('');
  });

  it('aceita o limite superior do catálogo', async () => {
    const user = userEvent.setup();
    render(<EpisodeSearchForm totalEpisodes={51} />);

    await user.type(screen.getByLabelText(/número do episódio/iu), '51');
    await user.click(screen.getByRole('button', { name: /ver elenco/iu }));

    expect(push).toHaveBeenCalledWith('/episode/51');
  });

  it('preenche o campo com o episódio atual quando informado', () => {
    render(<EpisodeSearchForm totalEpisodes={51} initialValue="28" />);

    expect(screen.getByLabelText(/número do episódio/iu)).toHaveValue(28);
  });
});
