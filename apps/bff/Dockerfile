# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
ENV PNPM_HOME=/pnpm
WORKDIR /repo

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY apps/bff/package.json apps/bff/
RUN pnpm install --frozen-lockfile
COPY packages/core ./packages/core
COPY apps/bff ./apps/bff
RUN pnpm --filter @zrp/core build && pnpm --filter @zrp/bff build
RUN pnpm deploy --filter @zrp/bff --prod --legacy /deploy

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 fastify

COPY --from=builder --chown=fastify:nodejs /deploy ./

USER fastify
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
