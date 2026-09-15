'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface CharacterAvatarProps {
  readonly characterId: number;
  readonly originUrl: string;
  readonly priority?: boolean;
  /** Em pixels. Sem isso o avatar preenche o contêiner posicionado. */
  readonly size?: number;
  readonly className?: string;
}

/**
 * Os avatares são baixados no build (scripts/prefetch-avatars.ts) e servidos
 * como estático da própria origem: nada de requisição à API em execução, que
 * limita por IP no Cloudflare (erro 1015) e devolvia 429 ao navegar entre
 * episódios.
 *
 * Já chegam em WebP 320px, o tamanho exato do card, então dispensam o
 * otimizador. A API fica só como rede de segurança para um personagem que
 * entre no catálogo sem ter passado pelo build.
 */
export function CharacterAvatar({
  characterId,
  originUrl,
  priority = false,
  size,
  className,
}: CharacterAvatarProps) {
  const [useOrigin, setUseOrigin] = useState(false);

  const shared = {
    src: useOrigin ? originUrl : `/avatars/${characterId}.webp`,
    alt: '',
    priority,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    unoptimized: !useOrigin,
    onError: () => setUseOrigin(true),
  };

  if (size !== undefined) {
    return <Image {...shared} width={size} height={size} className={className} />;
  }

  return <Image {...shared} fill sizes="320px" className={className} />;
}
