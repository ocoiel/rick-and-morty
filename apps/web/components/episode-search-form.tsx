'use client';

import { useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseEpisodeInput } from '@/lib/episode-input';

export interface EpisodeSearchFormProps {
  readonly totalEpisodes: number;
  readonly autoFocus?: boolean;
}

export function EpisodeSearchForm({ totalEpisodes, autoFocus = false }: EpisodeSearchFormProps) {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const episode = parseEpisodeInput(value, totalEpisodes);
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
        <Input
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
          className="h-14 flex-1 bg-surface px-4 text-lg md:text-lg"
        />

        <Button type="submit" disabled={isPending} className="h-14 px-8 text-base sm:min-w-40">
          {isPending ? 'Abrindo…' : 'Ver elenco'}
        </Button>
      </div>

      <p
        id={errorId}
        data-testid="search-error"
        role="alert"
        aria-live="polite"
        className={`mt-2 text-sm text-plumbus transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}
      >
        {error ?? ' '}
      </p>
    </form>
  );
}
