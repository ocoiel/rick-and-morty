'use client';

import { CharacterAvatar } from './character-avatar';
import { StatusBadge } from './status-badge';

import type { Character } from '@zrp/core';

export interface CharacterCardProps {
  readonly character: Character;
  readonly priority: boolean;
  readonly onSelect: (character: Character) => void;
  readonly onPrefetch: (character: Character) => void;
}

export function CharacterCard({ character, priority, onSelect, onPrefetch }: CharacterCardProps) {
  return (
    <button
      type="button"
      data-testid="character-card"
      onClick={() => onSelect(character)}
      onMouseEnter={() => onPrefetch(character)}
      onFocus={() => onPrefetch(character)}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-card border border-border bg-surface text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-portal-dim hover:shadow-[0_8px_30px_-12px_rgba(127,209,74,0.35)]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-raised">
        <CharacterAvatar src={character.imageUrl} priority={priority} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-ink" title={character.name}>
          {character.name}
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <StatusBadge status={character.status} />
          <span className="truncate text-xs text-ink-faint" title={character.species}>
            {character.species}
          </span>
        </div>
      </div>
    </button>
  );
}
