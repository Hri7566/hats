FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install

RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --production --ignore-scripts

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN ./node_modules/.bin/prisma generate

ENV SERVICE="server"

USER bun
ENTRYPOINT [ "sh", "-c", "[ \"$SERVICE\" = \"server\" ] && ./node_modules/.bin/prisma db push; exec bun start:docker" ]
