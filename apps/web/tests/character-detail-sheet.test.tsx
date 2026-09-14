import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CharacterDetailSheet } from '@/components/character-detail-sheet';
import { makeCharacter } from './fixtures';
import { render, screen, waitFor, within } from './render';

function mockFetch(response: Response | Error) {
  const fn = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response.clone();
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const character = makeCharacter({ id: 2, name: 'Morty Smith', species: 'Human' });

describe('CharacterDetailSheet', () => {
  it('exibe os atributos do personagem já disponíveis no servidor', () => {
    mockFetch(jsonResponse({ characterId: 2, episodes: [] }));
    render(<CharacterDetailSheet character={character} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Morty Smith' })).toBeInTheDocument();
    expect(within(dialog).getByText('Earth (C-137)')).toBeInTheDocument();
    expect(within(dialog).getByText('Citadel of Ricks')).toBeInTheDocument();
  });

  it('busca e lista as aparições do personagem', async () => {
    const fetchFn = mockFetch(
      jsonResponse({
        characterId: 2,
        episodes: [
          { number: 1, code: 'S01E01' },
          { number: 2, code: 'S01E02' },
        ],
      }),
    );

    render(<CharacterDetailSheet character={character} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('S01E01')).toBeInTheDocument();
    });
    expect(screen.getByText('S01E02')).toBeInTheDocument();
    expect(fetchFn).toHaveBeenCalledWith('/api/characters/2/episodes');
  });

  it('mostra estado de carregamento antes da resposta', () => {
    mockFetch(jsonResponse({ characterId: 2, episodes: [] }));
    render(<CharacterDetailSheet character={character} onClose={vi.fn()} />);

    expect(screen.getByLabelText(/carregando aparições/iu)).toBeInTheDocument();
  });

  it('comunica falha ao carregar aparições sem quebrar o resto do painel', async () => {
    mockFetch(jsonResponse({ error: 'boom' }, 500));

    render(<CharacterDetailSheet character={character} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar as aparições/iu)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Morty Smith' })).toBeInTheDocument();
  });

  it('fecha pelo botão de fechar', async () => {
    mockFetch(jsonResponse({ characterId: 2, episodes: [] }));
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<CharacterDetailSheet character={character} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha ao clicar fora do painel', async () => {
    mockFetch(jsonResponse({ characterId: 2, episodes: [] }));
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<CharacterDetailSheet character={character} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /fechar detalhes/iu }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('move o foco para o painel ao abrir', async () => {
    mockFetch(jsonResponse({ characterId: 2, episodes: [] }));
    render(<CharacterDetailSheet character={character} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
    });
  });

  it('declara-se como diálogo modal rotulado', () => {
    mockFetch(jsonResponse({ characterId: 2, episodes: [] }));
    render(<CharacterDetailSheet character={character} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Morty Smith');
  });
});
