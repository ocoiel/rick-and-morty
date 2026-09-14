import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CastExplorer } from '@/components/cast-explorer';
import { EpisodeNav } from '@/components/episode-nav';
import { EpisodeSearchForm } from '@/components/episode-search-form';
import { getEpisodeCast, listEpisodeNumbers } from '@/lib/episodes';

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

async function EpisodeSearch({ params }: EpisodePageProps) {
  const { id } = await params;
  const episodes = await listEpisodeNumbers();

  return <EpisodeSearchForm totalEpisodes={episodes.length} initialValue={id} />;
}

function EpisodeSearchSkeleton() {
  return (
    <div className="w-full">
      <div className="shimmer mb-2 h-5 w-36 rounded" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="shimmer flex-1 rounded-xl px-4 py-3 text-lg">&nbsp;</div>
        <div className="shimmer rounded-xl px-6 py-3 sm:min-w-36">&nbsp;</div>
      </div>
      <p className="mt-2 text-sm">&nbsp;</p>
    </div>
  );
}

async function EpisodeCast({ params }: EpisodePageProps) {
  const { id } = await params;
  const episodes = await listEpisodeNumbers();

  if (!episodes.includes(Number(id))) notFound();

  const cast = await getEpisodeCast(id);

  if (!cast) notFound();

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-portal">
            {cast.episode.code}
          </p>
          <h1 className="mt-1 text-balance text-3xl font-bold leading-tight sm:text-4xl">
            {cast.episode.name}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">Exibido em {cast.episode.airDate}</p>
        </div>

        <EpisodeNav current={cast.episode.number} total={episodes.length} />
      </header>

      <CastExplorer characters={cast.characters} />
    </>
  );
}

function CastSkeleton() {
  return (
    <>
      <div className="mb-8 space-y-2">
        <div className="shimmer h-4 w-20 rounded" />
        <div className="shimmer h-9 w-72 max-w-full rounded" />
        <div className="shimmer h-4 w-44 rounded" />
      </div>
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
    <main id="conteudo" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-sm text-ink-muted transition-colors hover:text-portal">
          ← Buscar outro episódio
        </Link>

        <div className="w-full sm:w-auto sm:min-w-80">
          <Suspense fallback={<EpisodeSearchSkeleton />}>
            <EpisodeSearch params={params} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<CastSkeleton />}>
        <EpisodeCast params={params} />
      </Suspense>
    </main>
  );
}
