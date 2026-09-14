import type { CharacterStatus } from '@zrp/core';

const STATUS_STYLES: Record<CharacterStatus, { dot: string; label: string }> = {
  Alive: { dot: 'bg-portal', label: 'Vivo' },
  Dead: { dot: 'bg-plumbus', label: 'Morto' },
  unknown: { dot: 'bg-ink-faint', label: 'Desconhecido' },
};

export function StatusBadge({ status }: { status: CharacterStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}
