import { UpstreamUnavailableError } from '../../domain/index.js';

export interface HttpClientOptions {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly retries: number;
  readonly fetchFn: typeof fetch;
}

export interface HttpResponse {
  readonly status: number;
  readonly body: unknown;
}

const RETRIABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export class HttpClient {
  constructor(private readonly options: HttpClientOptions) {}

  async get(path: string): Promise<HttpResponse> {
    const url = `${this.options.baseUrl}${path}`;
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.options.retries; attempt += 1) {
      if (attempt > 0) {
        await delay(2 ** (attempt - 1) * 100);
      }

      try {
        const response = await this.options.fetchFn(url, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(this.options.timeoutMs),
        });

        if (RETRIABLE_STATUS.has(response.status)) {
          lastError = new UpstreamUnavailableError(
            `Origem respondeu ${response.status} para ${path}.`,
          );
          continue;
        }

        if (response.status === 404) {
          return { status: 404, body: null };
        }

        if (!response.ok) {
          throw new UpstreamUnavailableError(
            `Origem respondeu ${response.status} para ${path}.`,
          );
        }

        return { status: response.status, body: await response.json() };
      } catch (error) {
        if (error instanceof UpstreamUnavailableError) throw error;
        lastError = error;
      }
    }

    throw new UpstreamUnavailableError(`Falha ao consultar ${path}.`, { cause: lastError });
  }
}
