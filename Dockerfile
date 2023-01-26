FROM node:14-alpine AS base

FROM base as dependencies

RUN apk add git
WORKDIR /app

############################## prod_package ##############################
# Install dependencies for production build
FROM dependencies as prod_package

COPY package.json yarn.lock /app/
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}
COPY .npmrc /app/.npmrc
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
RUN yarn install --ignore-scripts --frozen-lockfile --prod

############################## dev_package ##############################
# Install dependencies for building and development
FROM prod_package as dev_package

RUN yarn install --ignore-scripts --frozen-lockfile

############################## copy_source_code ##############################
# Install dependencies for building and development
FROM dev_package as copy_source_code

COPY tsconfig.json /app/tsconfig.json
COPY . /app/

############################## build_kubernetes ##############################
FROM copy_source_code AS build_kubernetes

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}

# Next.js expects the environment variables to be present at build time so they can be compiled into the build.
# See https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
COPY .env.k8s.${ENVIRONMENT} /app/.env
RUN yarn prepare
RUN yarn build

############################## compile_release_kubernetes ##############################
FROM base AS compile_release_kubernetes

RUN apk add git
WORKDIR /app
COPY tsconfig.json /app/tsconfig.json
COPY --from=build_kubernetes /app/. /app/


############################## release ##############################
# Kubernetes build target for the release
FROM compile_release_kubernetes AS release

EXPOSE 3000
USER node
CMD ["yarn", "start"]
