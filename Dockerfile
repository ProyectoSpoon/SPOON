FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias basadas en el archivo lock
RUN npm ci

# Configuración para desarrollo o producción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir la aplicación Next.js
ENV NEXT_TELEMETRY_DISABLED 1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar wget para el HEALTHCHECK
RUN apk add --no-cache wget

# Crear estructura de directorios y establecer permisos
RUN mkdir -p /app/.next/cache/images && chown -R nextjs:nodejs /app/.next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Healthcheck para confirmar que la aplicación está funcionando
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
