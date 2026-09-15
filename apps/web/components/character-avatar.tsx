'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const MAX_ATTEMPTS = 4;
const BACKOFF_BASE_MS = 700;

export interface CharacterAvatarProps {
  readonly src: string;
  readonly priority: boolean;
}

/**
 * A origem dos avatares limita requisições por janela de tempo. Num episódio
 * cheio o navegador pede 65 imagens de uma vez e parte volta 429, o que
 * deixaria buracos permanentes no grid. Cada avatar tenta de novo com espera
 * crescente até o cache do otimizador encher.
 */
export function CharacterAvatar({ src, priority }: CharacterAvatarProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  function handleError() {
    if (attempt >= MAX_ATTEMPTS) {
      setFailed(true);
      return;
    }

    // O jitter evita que as 65 imagens voltem todas juntas e derrubem de novo.
    const espera = BACKOFF_BASE_MS * 2 ** attempt + Math.random() * 400;
    timer.current = setTimeout(() => setAttempt((current) => current + 1), espera);
  }

  if (failed) {
    return <div aria-hidden className="size-full bg-surface-raised" />;
  }

  return (
    <Image
      // Trocar a key remonta o <img>, que é o que dispara a nova tentativa.
      key={attempt}
      src={src}
      alt=""
      fill
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      sizes="320px"
      onError={handleError}
      className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
    />
  );
}
