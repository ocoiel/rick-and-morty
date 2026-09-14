import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="conteudo" className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <div className="rise text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-plumbus">
          Dimensão desconhecida
        </p>
        <h1 className="mt-3 text-balance text-3xl font-bold">Esse episódio não existe</h1>
        <p className="mt-3 text-ink-muted">O número informado está fora do catálogo da série.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-portal px-6 py-3 font-semibold text-void transition-colors hover:bg-portal-bright"
        >
          Buscar outro episódio
        </Link>
      </div>
    </main>
  );
}
