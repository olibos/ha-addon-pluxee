FROM oven/bun:1.1-alpine as depencies
WORKDIR /src
COPY src/package.json src/bun.lockb ./
RUN bun install


FROM oven/bun:1.1-alpine as builder
WORKDIR /src
COPY src .
COPY --from=depencies /src/node_modules/ /src/node_modules/
RUN bun run build

FROM ghcr.io/hassio-addons/base-nodejs:0.2.1
WORKDIR /app
COPY --from=builder /docker/index.mjs .

CMD [ "node", "./index.mjs" ]