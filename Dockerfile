FROM rust
SHELL [ "/bin/bash", "-c" ]

RUN apt-get update \
 && apt-get install -y curl

RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash \
 && cargo binstall -y mdbook mdbook-admonish mdbook-linkcheck mdbook-mermaid
