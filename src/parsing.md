# Parsing

[Parsing in
Spicy](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#)
is centered around the `unit` type which in many ways looks similar to a
`struct` type.

A unit declares an ordered list of fields which are parsed from the input.

If a unit is `public` it can serve as a top-level entry point for parsing.

```spicy
module foo;

public type Foo = unit {
    version: uint32;

    on %done { print "The version is %s." % self.version; }
};
```

- The parser for `Foo` consists of a single parser which extracts an `uint32`
  with the default network byte order.
- The extracted `uint32` is bound to a named field to store its value in the unit.
- We added a [unit
  hook](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#unit-hooks)
  which runs when the parser is done.

We can run that parser by using a driver which feeds it input (potentially incrementally).

```console
$ printf '\x00\x00\x00\xFF' | spicy-driver -d hello.spicy
The version is 255.
```

We use
[`spicy-driver`](https://docs.zeek.org/projects/spicy/en/latest/toolchain.html#spicy-driver)
as driver. It reads input from its stdin and feeds it to the parser, and
executes hooks.

Another driver is
[`spicy-dump`](https://docs.zeek.org/projects/spicy/en/latest/toolchain.html#spicy-dump)
which prints the unit after parsing. Zeek includes its own dedicated driver for
Spicy parsers.

The major differences to `struct` are:

- `unit` fields need to have a [parsable
  type](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#parsing-types),
- by default all `unit` fields are `&optional`, i.e., a `unit` value can have
  any or all fields unset.
