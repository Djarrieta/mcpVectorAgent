FROM oven/bun:1.1.13

WORKDIR /app

COPY . .


RUN curl -fsSL https://astral.sh/uv/install.sh | bash
ENV PATH="/root/.cargo/bin:${PATH}"

RUN bun install --frozen-lockfile

ENV NODE_ENV=production

CMD ["bun", "src/server.ts"]
