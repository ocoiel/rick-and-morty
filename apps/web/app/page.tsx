import { Suspense } from 'react';
import { EpisodeSearchForm } from '@/components/episode-search-form';
import { listEpisodeNumbers } from '@/lib/episodes';

async function SearchPanel() {
  const episodes = await listEpisodeNumbers();

  return <EpisodeSearchForm totalEpisodes={episodes.length} autoFocus />;
}

function SearchPanelSkeleton() {
  return (
    <div className="w-full">
      <div className="shimmer mb-2 h-4 w-36 rounded" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="shimmer h-14 flex-1 rounded-lg" />
        <div className="shimmer h-14 rounded-lg sm:w-40" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16"
    >
      <div className="rise">
        <h1 className="text-balance font-display text-4xl font-bold leading-[1.1] tracking-[-0.03em] sm:text-5xl">
          Quem aparece em cada episódio
        </h1>

        <p className="mt-4 text-balance text-lg leading-relaxed text-ink-muted">
          Digite o número de um episódio e veja todo o elenco em ordem alfabética.
        </p>

        <div className="mt-10">
          <Suspense fallback={<SearchPanelSkeleton />}>
            <SearchPanel />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
