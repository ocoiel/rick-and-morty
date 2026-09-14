# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/core/package.json packages/core/
COPY apps/bff/package.json apps/bff/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /repo/apps/bff/node_modules ./apps/bff/node_modules
COPY tsconfig.base.json ./
COPY packages/core ./packages/core
COPY apps/bff ./apps/bff
RUN pnpm --filter @zrp/core build && pnpm --filter @zrp/bff build

FROM base AS pruner
COPY --from=builder /repo/package.json /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml /repo/.npmrc ./
COPY --from=builder /repo/packages/core/package.json packages/core/
COPY --from=builder /repo/apps/bff/package.json apps/bff/
RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 fastify

COPY --from=pruner --chown=nodejs:nodejs /repo/node_modules ./node_modules
COPY --from=pruner --chown=nodejs:nodejs /repo/packages/core/node_modules ./packages/core/node_modules
COPY --from=pruner --chown=nodejs:nodejs /repo/apps/bff/node_modules ./apps/bff/node_modules
COPY --from=builder --chown=nodejs:nodejs /repo/packages/core/package.json ./packages/core/
COPY --from=builder --chown=nodejs:nodejs /repo/packages/core/dist ./packages/core/dist
COPY --from=builder --chown=nodejs:nodejs /repo/apps/bff/package.json ./apps/bff/
COPY --from=builder --chown=nodejs:nodejs /repo/apps/bff/dist ./apps/bff/dist

USER fastify
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/bff/dist/main.js"]
