FROM rust
SHELL [ "/bin/bash", "-c" ]

RUN apt-get update \
 && apt-get install -y curl

RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash \
 && cargo binstall -y \
      mdbook@0.4.52 \
      mdbook-admonish@1.20.0 \
      mdbook-linkcheck@0.7.7 \
      mdbook-mermaid@0.16.0
