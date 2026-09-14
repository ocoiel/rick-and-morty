import { UpstreamUnavailableError } from '../../domain/index.js';
import { Semaphore } from './semaphore.js';

export interface HttpClientOptions {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly retries: number;
  readonly fetchFn: typeof fetch;
  readonly maxConcurrency?: number;
  readonly backoffBaseMs?: number;
}

export interface HttpResponse {
  readonly status: number;
  readonly body: unknown;
}

const RETRIABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const DEFAULT_MAX_CONCURRENCY = 3;
const DEFAULT_BACKOFF_BASE_MS = 500;
const MAX_BACKOFF_MS = 10_000;

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function retryAfterMs(response: Response): number | null {
  const header = response.headers.get('retry-after');
  if (!header) return null;

  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : null;
}

export class HttpClient {
  private readonly semaphore: Semaphore;
  private readonly backoffBaseMs: number;

  constructor(private readonly options: HttpClientOptions) {
    this.semaphore = new Semaphore(options.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY);
    this.backoffBaseMs = options.backoffBaseMs ?? DEFAULT_BACKOFF_BASE_MS;
  }

  async get(path: string): Promise<HttpResponse> {
    const url = `${this.options.baseUrl}${path}`;
    let lastError: unknown;
    let waitMs = 0;

    for (let attempt = 0; attempt <= this.options.retries; attempt += 1) {
      if (waitMs > 0) await delay(waitMs);

      try {
        const response = await this.semaphore.run(() =>
          this.options.fetchFn(url, {
            headers: { accept: 'application/json' },
            signal: AbortSignal.timeout(this.options.timeoutMs),
          }),
        );

        if (response.status === 404) {
          return { status: 404, body: null };
        }

        if (RETRIABLE_STATUS.has(response.status)) {
          lastError = new UpstreamUnavailableError(
            `Origem respondeu ${response.status} para ${path}.`,
          );
          waitMs = Math.min(
            retryAfterMs(response) ?? this.backoffBaseMs * 2 ** attempt,
            MAX_BACKOFF_MS,
          );
          continue;
        }

        if (!response.ok) {
          throw new UpstreamUnavailableError(`Origem respondeu ${response.status} para ${path}.`);
        }

        return { status: response.status, body: await response.json() };
      } catch (error) {
        if (error instanceof UpstreamUnavailableError) throw error;
        lastError = error;
        waitMs = Math.min(this.backoffBaseMs * 2 ** attempt, MAX_BACKOFF_MS);
      }
    }

    throw new UpstreamUnavailableError(`Falha ao consultar ${path}.`, { cause: lastError });
  }
}
