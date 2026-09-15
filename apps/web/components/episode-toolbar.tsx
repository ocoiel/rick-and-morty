'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { parseEpisodeInput } from '@/lib/episode-input';

export interface EpisodeToolbarProps {
  readonly current: number;
  readonly total: number;
}

const STEP =
  'inline-flex size-10 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-portal-dim hover:text-portal';

export function EpisodeToolbar({ current, total }: EpisodeToolbarProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(String(current));

  // Navegar pelas setas troca o episódio sem remontar a barra.
  useEffect(() => setDraft(String(current)), [current]);

  const previous = current > 1 ? current - 1 : null;
  const next = current < total ? current + 1 : null;

  function jump(raw: string) {
    const episode = parseEpisodeInput(raw, total);

    if (episode === null || episode === current) {
      setDraft(String(current));
      return;
    }

    router.push(`/episode/${episode}`);
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg py-2 pr-2 text-sm text-ink-muted transition-colors hover:text-portal"
      >
        <ArrowLeft aria-hidden strokeWidth={1.5} className="size-5 sm:size-4" />
        <span className="max-sm:sr-only">Buscar outro episódio</span>
      </Link>

      <nav aria-label="Navegação entre episódios" className="flex items-center gap-2">
        {previous === null ? (
          <span
            className={`${STEP} cursor-not-allowed opacity-35`}
            aria-disabled="true"
            aria-label="Episódio anterior"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </span>
        ) : (
          <Link
            href={`/episode/${previous}`}
            prefetch
            data-testid="nav-previous"
            aria-label="Episódio anterior"
            className={STEP}
          >
            <ChevronLeft aria-hidden className="size-5" />
          </Link>
        )}

        <label className="sr-only" htmlFor="episodio-atual">
          Número do episódio
        </label>
        <Input
          id="episodio-atual"
          type="number"
          inputMode="numeric"
          min={1}
          max={total}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => jump(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              jump(draft);
            }
          }}
          className="h-10 w-20 bg-surface text-center text-base tabular-nums md:text-base"
        />

        <span className="whitespace-nowrap text-sm text-ink-faint">de {total}</span>

        {next === null ? (
          <span
            className={`${STEP} cursor-not-allowed opacity-35`}
            aria-disabled="true"
            aria-label="Próximo episódio"
          >
            <ChevronRight aria-hidden className="size-5" />
          </span>
        ) : (
          <Link
            href={`/episode/${next}`}
            prefetch
            data-testid="nav-next"
            aria-label="Próximo episódio"
            className={STEP}
          >
            <ChevronRight aria-hidden className="size-5" />
          </Link>
        )}
      </nav>
    </div>
  );
}
