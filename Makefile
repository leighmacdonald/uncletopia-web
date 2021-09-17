.PHONY: frontend
GO_CMD=go
GO_BUILD_FLAGS=$(GO_CMD) build -trimpath -o uncletopia-web

all: build

vet:
	@CGO_ENABLED=0 go vet . ./...

fmt:
	@CGO_ENABLED=0 go fmt . ./...

yarn_install:
	@cd frontend && yarn install && cd ..

frontend:
	@cd frontend && yarn run build && cp -rv src/public/* dist/ && cd ..

watch:
	@cd frontend && yarn run watch && cd ..

serve:
	@CGO_ENABLED=0 go run main.go

js_deps: yarn_install

build: clean fmt vet
	@CGO_ENABLED=0 $(GO_BUILD_FLAGS)

run: build
	@./uncletopia-web

test:
	@CGO_ENABLED=0 go test -race -cover . ./...

testcover:
	@CGO_ENABLED=0 go test -race -coverprofile c.out ./...

lint:
	@CGO_ENABLED=0 golangci-lint run

bench:
	@CGO_ENABLED=0 go test -run=NONE -bench=. ./...

clean:
	@CGO_ENABLED=0 go clean $(GO_FLAGS) -i
	@rm -rf ./frontend/dist

run_image: image
	@docker run --rm -p 8004:8004 -v "$(pwd)/config.yaml:/app/config.yaml" leighmacdonald/uncletopia-web:latest

image:
	@docker build -t leighmacdonald/uncletopia-web:latest .

publish: image
	docker push leighmacdonald/uncletopia-web:latest
