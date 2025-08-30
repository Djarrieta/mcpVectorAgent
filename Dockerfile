FROM oven/bun:1.1.13

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

ENV NODE_ENV=production

CMD ["bun", "src/server.ts"]
