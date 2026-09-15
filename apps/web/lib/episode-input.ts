/**
 * Interpreta o que o usuário digitou como número de episódio.
 * Retorna null quando o valor não serve para navegar.
 */
export function parseEpisodeInput(raw: string, totalEpisodes: number): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed)) return null;
  if (parsed < 1 || parsed > totalEpisodes) return null;

  return parsed;
}
