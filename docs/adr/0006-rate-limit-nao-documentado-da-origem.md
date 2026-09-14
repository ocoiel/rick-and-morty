# 6. Convivência com o rate limit não documentado da origem

Aceita — 2026-09-14

## Contexto

A documentação da API não menciona limite de requisições. Na prática ele
existe: a primeira tentativa de pré-renderizar as 51 rotas falhou com
HTTP 429 no episódio 51, abortando a construção.

A causa é o paralelismo. O Next distribui a geração estática entre vários
processos de trabalho, e cada um mantinha seu próprio cliente HTTP sem
qualquer coordenação.

## Decisão

Tratar o limite como característica da origem, e não como falha
transitória a ignorar:

- **Semáforo** no cliente HTTP, limitando a três requisições simultâneas
  por processo.
- **Retentativa com espera exponencial**, teto de 10 segundos, restrita a
  status efetivamente temporários. Um 400 não é repetido.
- **Respeito ao cabeçalho `Retry-After`** quando a origem o envia, em
  lugar da espera calculada.
- **Redução dos processos de trabalho** da construção para três.

Os avatares deixaram de passar pelo otimizador de imagens do Next, que
reproduzia o mesmo problema ao buscar 65 arquivos de uma vez. Ver
[ADR 2](0002-geracao-estatica-das-rotas-de-episodio.md).

## Consequências

A construção passou de aproximadamente 6 para 55 segundos. O tempo é
dominado por espera deliberada, não por processamento.

O custo é integralmente pago em tempo de construção. O tempo de resposta
em produção permanece de 3 a 5 ms, porque as páginas já estão prontas.

A alternativa seria elevar o paralelismo e aceitar falhas intermitentes
na construção — comportamento pior, porque transforma a publicação em
algo não determinístico.

O semáforo é por processo, não global. Se a construção voltasse a ser
distribuída de forma mais ampla, o limite efetivo cresceria de novo, e o
próximo passo seria coordenação externa.
