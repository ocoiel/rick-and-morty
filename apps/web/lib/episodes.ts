import 'server-only';

import { cacheLife } from 'next/cache';
import { EpisodeNotFoundError, InvalidEpisodeNumberError } from '@zrp/core';
import { container } from './container';

import type { EpisodeCastPayload } from '@zrp/core';

export async function getEpisodeCast(episode: string): Promise<EpisodeCastPayload | null> {
  'use cache';
  cacheLife('max');

  try {
    return await container.getEpisodeCast.execute({ episode });
  } catch (error) {
    if (error instanceof EpisodeNotFoundError || error instanceof InvalidEpisodeNumberError) {
      return null;
    }
    throw error;
  }
}

export async function listEpisodeNumbers(): Promise<readonly number[]> {
  'use cache';
  cacheLife('max');

  return await container.listEpisodeNumbers.execute();
}
