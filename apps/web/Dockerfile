# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /repo

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY packages/design-tokens/package.json packages/design-tokens/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY packages/core ./packages/core
COPY packages/design-tokens ./packages/design-tokens
COPY apps/web ./apps/web
# "..." inclui as dependências de workspace em ordem topológica: um pacote novo
# no grafo não exige lembrar de editar esta linha.
RUN pnpm --filter "@zrp/web..." build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
