import Link from 'next/link';

export interface EpisodeNavProps {
  readonly current: number;
  readonly total: number;
}

export function EpisodeNav({ current, total }: EpisodeNavProps) {
  const previous = current > 1 ? current - 1 : null;
  const next = current < total ? current + 1 : null;

  const base =
    'rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-portal-dim hover:text-portal';

  return (
    <nav aria-label="Navegação entre episódios" className="flex items-center gap-2">
      {previous === null ? (
        <span className={`${base} cursor-not-allowed opacity-35`} aria-disabled="true">
          ← Anterior
        </span>
      ) : (
        <Link href={`/episode/${previous}`} prefetch data-testid="nav-previous" className={base}>
          ← Anterior
        </Link>
      )}

      {next === null ? (
        <span className={`${base} cursor-not-allowed opacity-35`} aria-disabled="true">
          Próximo →
        </span>
      ) : (
        <Link href={`/episode/${next}`} prefetch data-testid="nav-next" className={base}>
          Próximo →
        </Link>
      )}
    </nav>
  );
}
