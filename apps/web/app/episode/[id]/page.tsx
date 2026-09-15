import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CastExplorer } from '@/components/cast-explorer';
import { EpisodeToolbar } from '@/components/episode-toolbar';
import { getEpisodeCast, listEpisodeNumbers } from '@/lib/episodes';

import type { Metadata } from 'next';

interface EpisodePageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export async function generateStaticParams() {
  const episodes = await listEpisodeNumbers();

  return episodes.map((number) => ({ id: String(number) }));
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { id } = await params;
  const cast = await getEpisodeCast(id);

  if (!cast) return { title: 'Episódio não encontrado' };

  return {
    title: `${cast.episode.code} · ${cast.episode.name}`,
    description: `${cast.meta.total} personagens em ${cast.episode.name}, em ordem alfabética.`,
  };
}

async function EpisodeHeader({ params }: EpisodePageProps) {
  const { id } = await params;
  const episodes = await listEpisodeNumbers();

  if (!episodes.includes(Number(id))) notFound();

  const cast = await getEpisodeCast(id);

  if (!cast) notFound();

  return (
    <>
      <EpisodeToolbar current={cast.episode.number} total={episodes.length} />

      <header className="mb-6">
        <h1 className="text-balance font-display text-2xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
          {cast.episode.name}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          <span className="font-medium text-portal">{cast.episode.code}</span>
          <span aria-hidden> · </span>
          Exibido em {cast.episode.airDate}
        </p>
      </header>

      <CastExplorer characters={cast.characters} />
    </>
  );
}

function EpisodeSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="shimmer h-6 w-44 rounded" />
        <div className="shimmer h-10 w-52 rounded-lg" />
      </div>

      <div className="mb-6 space-y-2">
        <div className="shimmer h-9 w-72 max-w-full rounded" />
        <div className="shimmer h-4 w-56 rounded" />
      </div>

      <div className="shimmer mb-5 h-12 w-full rounded-lg" />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <li key={index} className="overflow-hidden rounded-card border border-border">
            <div className="shimmer aspect-square" />
            <div className="space-y-2 p-3">
              <div className="shimmer h-4 w-4/5 rounded" />
              <div className="shimmer h-3 w-2/5 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function EpisodePage({ params }: EpisodePageProps) {
  return (
    <main id="conteudo" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Suspense fallback={<EpisodeSkeleton />}>
        <EpisodeHeader params={params} />
      </Suspense>
    </main>
  );
}
