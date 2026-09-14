'use client';

import { useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface EpisodeSearchFormProps {
  readonly totalEpisodes: number;
  readonly initialValue?: string;
  readonly autoFocus?: boolean;
}

export function EpisodeSearchForm({
  totalEpisodes,
  initialValue = '',
  autoFocus = false,
}: EpisodeSearchFormProps) {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validate(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed === '') return null;

    const parsed = Number(trimmed);
    if (!Number.isSafeInteger(parsed) || parsed < 1) return null;
    if (parsed > totalEpisodes) return null;

    return parsed;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const episode = validate(value);
    if (episode === null) {
      setError(`Informe um número de episódio entre 1 e ${totalEpisodes}.`);
      return;
    }

    setError(null);
    startTransition(() => {
      router.push(`/episode/${episode}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-ink-muted">
        Número do episódio
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          name="episode"
          type="number"
          inputMode="numeric"
          min={1}
          max={totalEpisodes}
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          placeholder={`1 a ${totalEpisodes}`}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-lg text-ink transition-colors placeholder:text-ink-faint hover:border-border-strong focus:border-portal focus:outline-none aria-[invalid=true]:border-plumbus"
        />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-portal px-6 py-3 font-semibold text-void transition-all duration-200 hover:bg-portal-bright disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-36"
        >
          {isPending ? 'Abrindo…' : 'Ver elenco'}
        </button>
      </div>

      <p
        id={errorId}
        data-testid="search-error"
        role="alert"
        aria-live="polite"
        className={`mt-2 text-sm text-plumbus transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}
      >
        {error ?? ' '}
      </p>
    </form>
  );
}
