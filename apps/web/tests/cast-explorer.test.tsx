import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CastExplorer } from '@/components/cast-explorer';
import { CAST } from './fixtures';
import { render, screen, waitFor, within } from './render';

vi.stubGlobal(
  'fetch',
  vi.fn(
    async () =>
      new Response(JSON.stringify({ characterId: 1, episodes: [{ number: 1, code: 'S01E01' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  ),
);

function cardNames() {
  return screen
    .getAllByTestId('character-card')
    .map((card) => within(card).getByRole('heading').textContent);
}

describe('CastExplorer', () => {
  it('renderiza todos os personagens recebidos', () => {
    render(<CastExplorer characters={CAST} />);

    expect(screen.getAllByTestId('character-card')).toHaveLength(4);
    expect(screen.getByTestId('cast-count')).toHaveTextContent('4 personagens');
  });

  it('preserva a ordem definida pelo servidor', () => {
    render(<CastExplorer characters={CAST} />);

    expect(cardNames()).toEqual([
      'Ábradolf Lincler',
      'Morty Smith',
      'Rick Sanchez',
      'Adjudicator Rick',
    ]);
  });

  it('filtra por nome enquanto o usuário digita', async () => {
    const user = userEvent.setup();
    render(<CastExplorer characters={CAST} />);

    await user.type(screen.getByLabelText(/filtrar elenco/iu), 'rick');

    expect(cardNames()).toEqual(['Rick Sanchez', 'Adjudicator Rick']);
    expect(screen.getByTestId('cast-count')).toHaveTextContent('2 de 4');
  });

  it('ignora acentuação na busca', async () => {
    const user = userEvent.setup();
    render(<CastExplorer characters={CAST} />);

    await user.type(screen.getByLabelText(/filtrar elenco/iu), 'abradolf');

    expect(cardNames()).toEqual(['Ábradolf Lincler']);
  });

  it('ignora diferença de caixa', async () => {
    const user = userEvent.setup();
    render(<CastExplorer characters={CAST} />);

    await user.type(screen.getByLabelText(/filtrar elenco/iu), 'MORTY');

    expect(cardNames()).toEqual(['Morty Smith']);
  });

  it('informa quando nenhum personagem corresponde', async () => {
    const user = userEvent.setup();
    render(<CastExplorer characters={CAST} />);

    await user.type(screen.getByLabelText(/filtrar elenco/iu), 'zzzz');

    expect(screen.queryAllByTestId('character-card')).toHaveLength(0);
    expect(screen.getByText(/nenhum personagem corresponde/iu)).toBeInTheDocument();
  });

  it('usa singular quando há apenas um personagem', () => {
    render(<CastExplorer characters={[CAST[0]!]} />);

    expect(screen.getByTestId('cast-count')).toHaveTextContent('1 personagem');
  });

  it('abre o detalhe do personagem ao clicar no card', async () => {
    const user = userEvent.setup();
    render(<CastExplorer characters={CAST} />);

    await user.click(screen.getAllByTestId('character-card')[1]!);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Morty Smith' })).toBeInTheDocument();
  });

  it('carrega as aparições depois que o personagem é selecionado', async () => {
    const user = userEvent.setup();
    render(<CastExplorer characters={CAST} />);

    await user.click(screen.getAllByTestId('character-card')[0]!);

    await waitFor(() => {
      expect(screen.getByTestId('appearance')).toHaveTextContent('S01E01');
    });
  });

  it('fecha o detalhe com a tecla Escape', async () => {
    const user = userEvent.setup();
    render(<CastExplorer characters={CAST} />);

    await user.click(screen.getAllByTestId('character-card')[0]!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
