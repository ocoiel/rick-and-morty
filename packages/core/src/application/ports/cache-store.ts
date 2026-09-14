/**
 * Porta de saída para armazenamento temporário de leitura.
 *
 * Mantida mínima de propósito: get/set cobrem o uso real e permitem
 * implementações triviais (memória, no-op) sem obrigar adaptadores a
 * suportar operações que a aplicação nunca chama.
 *
 * Contrato: um cache jamais deve derrubar a requisição. Implementações que
 * dependem de I/O devem engolir os próprios erros e se comportar como miss.
 */
export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
}
