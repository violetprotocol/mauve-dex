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

############################## nginx ##############################
# Kubernetes build target for the release
# nginx state for serving content
FROM nginx:1.23.2-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build_kubernetes /app/build /usr/share/nginx/html
RUN touch /var/run/nginx.pid
RUN chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

