import { describe, expect, it } from 'vitest';
import { EpisodeNav } from '@/components/episode-nav';
import { render, screen } from './render';

describe('EpisodeNav', () => {
  it('liga para o episódio anterior e o próximo', () => {
    render(<EpisodeNav current={10} total={51} />);

    expect(screen.getByTestId('nav-previous')).toHaveAttribute('href', '/episode/9');
    expect(screen.getByTestId('nav-next')).toHaveAttribute('href', '/episode/11');
  });

  it('desabilita o anterior no primeiro episódio', () => {
    render(<EpisodeNav current={1} total={51} />);

    expect(screen.queryByTestId('nav-previous')).not.toBeInTheDocument();
    expect(screen.getByText(/anterior/iu)).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('nav-next')).toHaveAttribute('href', '/episode/2');
  });

  it('desabilita o próximo no último episódio', () => {
    render(<EpisodeNav current={51} total={51} />);

    expect(screen.queryByTestId('nav-next')).not.toBeInTheDocument();
    expect(screen.getByTestId('nav-previous')).toHaveAttribute('href', '/episode/50');
  });

  it('desabilita ambos quando o catálogo tem um único episódio', () => {
    render(<EpisodeNav current={1} total={1} />);

    expect(screen.queryByTestId('nav-previous')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-next')).not.toBeInTheDocument();
  });

  it('expõe-se como região de navegação rotulada', () => {
    render(<EpisodeNav current={5} total={51} />);

    expect(
      screen.getByRole('navigation', { name: /navegação entre episódios/iu }),
    ).toBeInTheDocument();
  });
});
