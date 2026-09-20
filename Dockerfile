FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm run typecheck && npm test && npm run build

FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS runtime
ENV NODE_ENV=production CAMPUS_CONTAINER=1 CAMPUS_DATA_DIR=/app/.local-data CAMPUS_BACKUP_DIR=/app/.local-data/backups PORT=4173
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && mkdir .local-data && chown node:node .local-data
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/scripts/transcribe.py /app/scripts/backup.mjs ./scripts/
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:4173/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist-server/index.js"]
