FROM node:16.13.2-alpine3.15 as base

FROM base as dependencies

RUN apk add git
WORKDIR /app

############################## prod_package ##############################
# Install dependencies for production build
FROM dependencies as prod_package

COPY package.json yarn.lock /app/
RUN yarn install --ignore-scripts --frozen-lockfile --prod

############################## dev_package ##############################
# Install dependencies for building and development
FROM prod_package as dev_package

RUN yarn install --ignore-scripts --frozen-lockfile

############################## copy_source_code ##############################
# Install dependencies for building and development
FROM dev_package as copy_source_code

COPY tsconfig.json /app/tsconfig.json
COPY ./ /app/

############################## build ##############################
FROM copy_source_code AS build_kubernetes

# ARG ENVIRONMENT
# ENV ENVIRONMENT=${ENVIRONMENT}
#
# # Next.js expects the environment variables to be present at build time so they can be compiled into the build.
# # See https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
# COPY ./.env.k8s.${ENVIRONMENT} /app/.env.local
RUN yarn build

############################## compile_release ##############################
FROM base AS compile_release_kubernetes

WORKDIR /app
COPY --from=prod_package /app/ /app/
COPY tsconfig.json /app/tsconfig.json
COPY --from=copy_source_code /app/next.config.js /app/next.config.js
COPY --from=copy_source_code /app/public/ /app/public/
COPY --from=build_kubernetes /app/.next /app/.next
RUN touch /app/newrelic_agent.log && chown node /app/newrelic_agent.log
RUN chown -R node /app/.next/cache

############################## release ##############################
# Build target for the release
FROM compile_release_kubernetes AS release

EXPOSE 3000
USER node
CMD ["yarn", "start"]
