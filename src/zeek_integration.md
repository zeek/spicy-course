# Zeek integration

[Zeek](https://zeek.org/) supports writing packet, protocol or file analyzers
with Spicy. In addition to allowing inclusion of unmodified Spicy grammars,
additional features include:

- [automatic
  generation](https://docs.zeek.org/en/master/devel/spicy/reference.html#interface-definitions-evt-files)
  of Zeek analyzers from Spicy parsers from [interface definition (EVT)
  files](https://docs.zeek.org/en/master/devel/spicy/reference.html#interface-definitions-evt-files)
- ability to trigger [Zeek
  events](https://docs.zeek.org/en/master/scripting/basics.html) from
  [Spicy](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#unit-hooks)
  [unit
  hooks](https://docs.zeek.org/en/master/devel/spicy/reference.html#event-definitions),
- (automatic) [exporting of
  types](https://docs.zeek.org/en/master/devel/spicy/reference.html#exporting-types)
  defined in Spicy as [Zeek record
  types](https://docs.zeek.org/en/master/scripting/basics.html#record-data-type),
- [a Spicy module to control Zeek](https://docs.zeek.org/en/master/devel/spicy/reference.html#controlling-zeek-from-spicy) from Spicy code.

## Getting started

The recommended approach to integrate a Spicy parser with Zeek is to use the
[default Zeek package template](https://github.com/zeek/package-template/).

We can create Zeek packet, protocol or file analyzers by selecting the
appropriate template feature. E.g., to create a new Zeek package for a protocol
analyzer and interactively provide required user variables,

```console
zkg create --packagedir my_analyzer --features spicy-protocol-analyzer
```

```admonish warning
`zkg` uses Git to track package information. When running in a VM, this can
cause issues if the package repository is in a mounted directory. If you run
into this trying creating the package in directory which is not mounted from the
host.
```

```admonish example
Use the template to create a Spicy protocol analyzer for analyzing TCP traffic
now to follow along with later examples.

This will create a protocol analyzer from the template. Items which need to be
updated are marked `TODO`. It will generate e.g.,

- `zkg.meta`: package metadata describing the package and setting up building and testing
- `analyzer/`
    - `*.evt`: interface definition for exposing Spicy parser as Zeek analyzer
    - `*.spicy`: Spicy grammar of the parser
    - `zeek_*.spicy`: Zeek-specific Spicy code
- `scripts/`
    - `main.zeek`: Zeek code for interacting with the analyzer
    - `dpd.sig`:
      [Signatures](https://docs.zeek.org/en/master/frameworks/signatures.html) for
      dynamic protocol detection (DPD)
- `testing/tests`: [BTest](https://github.com/zeek/btest#readme) test cases
```

```admonish info
You can use `zkg` to install the package into your Zeek installation.

~~~plain
zkg install <package_dir>
~~~

To run its tests, e.g., during development:

~~~plain
zkg test <package_dir>
~~~

The generated project uses CMake for building and BTest for testing. You can
build manually, e.g., during development. The test scaffolding assumes that the
CMake build directory is named `build`.

~~~sh
# Building.
mkdir build
(cd build && cmake .. && make)

# Testing.
(cd testing && btest)
~~~
```

<details>

We can show available template features with `zkg template info`.

```console
$ zkg template info
API version: 1.0.0
features: github-ci, license, plugin, spicy-file-analyzer, spicy-packet-analyzer, spicy-protocol-analyzer
origin: https://github.com/zeek/package-template
provides package: true
user vars:
    name: the name of the package, e.g. "FooBar" or "spicy-http", no default, used by package, spicy-protocol-analyzer, spicy-file-analyzer, spicy-packet-analyzer
    namespace: a namespace for the package, e.g. "MyOrg", no default, used by plugin
    analyzer: name of the Spicy analyzer, which typically corresponds to the protocol/format being parsed (e.g. "HTTP", "PNG"), no default, used by spicy-protocol-analyzer, spicy-file-analyzer, spicy-packet-analyzer
    protocol: transport protocol for the analyzer to use: TCP or UDP, no default, used by spicy-protocol-analyzer
    unit: name of the top-level Spicy parsing unit for the file/packet format (e.g. "File" or "Packet"), no default, used by spicy-file-analyzer, spicy-packet-analyzer
    unit_orig: name of the top-level Spicy parsing unit for the originator side of the connection (e.g. "Request"), no default, used by spicy-protocol-analyzer
    unit_resp: name of the top-level Spicy parsing unit for the responder side of the connection (e.g. "Reply"); may be the same as originator side, no default, used by spicy-protocol-analyzer
    author: your name and email address, Benjamin Bannier <benjamin.bannier@corelight.com>, used by license
    license: one of apache, bsd-2, bsd-3, mit, mpl-2, no default, used by license
versions: v0.99.0, v1.0.0, v2.0.0, v3.0.0, v3.0.1, v3.0.2
```

</details>
