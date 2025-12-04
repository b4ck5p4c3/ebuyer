# syntax=docker.io/docker/dockerfile:1

FROM node:24-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate


FROM base AS builder

## Install deps
COPY package.json pnpm-lock.yaml  ./
RUN pnpm i --frozen-lockfile

## Copy rest of the files, and build the app
COPY . .
RUN pnpm run build
CMD pnpm run start