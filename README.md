# Spicy training materials

This repository contains training materials for [Spicy](https://docs.zeek.org/projects/spicy/en/latest/). A rendered version is hosted at <https://static.zeek.org/spicy-course/index.html>.

## CI/CD

For pull requests we run linters, formatters and spell checkers.

On commit to the `main` branch we automatically build updated docs and deploy them.

## Development

We use [mdbook](https://rust-lang.github.io/mdBook/) to render the final course document from Markdown sources. See e.g., <https://commonmark.org/help/> for how to use Markdown. Each section is in a separate file under `src/` which is linked in `src/SUMMARY.md`.

To render the final documentation a top-level Makefile is provided (requires `make`, Docker CLI, `jq`). Output is in the `book` folder.

    make
    open book/index.html

This repository comes with a vscode setup which defines tasks

- _Build docs_: render documentation
- _Build and serve docs_: Continuously watches and rebuilds sources on changes, and serves them

We also ship a [dev container](https://code.visualstudio.com/docs/devcontainers/containers) which comes with all required tools.

### Additional tools

We use the following tools:

- [mdbook-admonish](https://github.com/tommilligan/mdbook-admonish) to render admonishment blocks
- [mdbook-mermaid](https://github.com/badboy/mdbook-mermaid) to render [mermaid.js](https://mermaid.js.org/#/) diagrams
- custom highlighting of code blocks for [EVT](src/js/highlight-evt.js), [Spicy](src/js/highlight-spicy.js) and [Zeek](src/js/highlight-zeek.js) source code. The highlighter are minimal, please extend them if code is not highlighted. To select a language use fenced code blocks with a language identifier (`evt`, `spicy`, `zeek`), e.g.,

      ```spicy
      print "Spicy code!";
      ```

- [pre-commit hooks](https://pre-commit.com/) for formatting, linting and spell-checking. To add words to the spell checker allow-list add them to `cspell.config.yaml`.

### Conventions

- To make the material suitable for presentation try to keep sections short (roughly a screen); feel free to break larger parts into smaller subsections.
- Exercises are separate (sub)sections.

  - if needed provide default-hidden hints with [HTML `details` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details), e.g.,

        <details>
          <summary>Hint</summary>

          Hint text goes here.
        </details>

    Use `<summary>Hint</summary>` for hints.

    You can use Markdown in the hint text; add an empty line after the `summary` tag if it is not rendered correctly.

  - If possible provide a default-hidden solution formatted like a hint, but with `<summary>Solution</Solution>`.
