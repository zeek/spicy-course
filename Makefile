IMAGE :=

build: docker.json
	@( \
		IMAGE=$$(cat $< | jq -r '."containerimage.digest"' | cut -d':' -f2); \
		docker run --rm -v $$PWD:/book -w /book $$IMAGE mdbook build \
	)
	@rm docker.json

docker.json: Dockerfile
	docker build --metadata-file docker.json .
