FROM golang:1.16-alpine AS backend
RUN apk add make
# gcc
WORKDIR /build
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN make

FROM node:16-alpine AS ui
RUN apk add build-base autoconf automake pngquant bash
WORKDIR /build
COPY frontend/yarn.lock .
COPY frontend/package.json .
RUN yarn install
COPY frontend/. .
RUN yarn run build

FROM alpine:latest
LABEL maintainer="Leigh MacDonald <leigh.macdonald@gmail.com>"
WORKDIR /app
COPY --from=backend /build/uncletopia-web .
COPY --from=ui /build/dist ./frontend/dist
EXPOSE 8003
CMD ["./uncletopia-web"]