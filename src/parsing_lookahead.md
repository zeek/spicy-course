# Lookahead parsing

[Lookahead
parsing](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#look-ahead)
is a core Spicy concept. Leveraging lookahead makes it possible to build concise
grammars which remain comprehensible and maintainable as the grammar grows.

## Deep dive: Parsing of lists of unknown size

We have already seen how we can use lookahead parsing to dynamically detect the
length of a list.

```spicy
type X = unit {
    : (b"A")[]; # Extract unknown number of literal 'A' bytes.
    x: uint8;
};
```

We can view the generated parser by requesting grammar debug output from Spicy's
`spicyc` compiler.

```console
$ spicyc -D grammar x.spicy -o /dev/null -p
#        ~~~~~~~~~~ ~~~~~~~ ~~~~~~~~~~~~ ~~
#        |          |          |          |
#        |          |          |          - emit generated IR
#        |          |          |
#        |          |          - redirect output of generated code to /dev/null
#        |          |
#        |          - compile file 'x.spicy'
#        |
#        - emit 'grammar' debug stream to stderr

[debug/grammar] === Grammar foo::X
[debug/grammar]         Epsilon: <epsilon> -> ()
[debug/grammar]           While: anon -> while(<look-ahead-found>): anon_2 [field: anon (*)] [item-type: vector<bytes>] [parse-type: vector<bytes>]
[debug/grammar]            Ctor: anon_2 -> b"A" (bytes) (container 'anon') [field: anon_2 (*)] [item-type: bytes] [parse-type: bytes]
[debug/grammar]       LookAhead: anon_l1 -> {uint<8> (not a literal)}: <epsilon> | {b"A" (bytes) (id 1)}: anon_l2
[debug/grammar]        Sequence: anon_l2 -> anon_2 anon_l1
[debug/grammar]  (*)       Unit: foo_X -> anon x
[debug/grammar]        Variable: x   -> uint<8> [field: x (*)] [item-type: uint<8>] [parse-type: uint<8>]
[debug/grammar]
[debug/grammar]   -- Epsilon:
[debug/grammar]      anon = true
[debug/grammar]      anon_l1 = true
[debug/grammar]      anon_l2 = false
[debug/grammar]      foo_X = false
[debug/grammar]
[debug/grammar]   -- First_1:
[debug/grammar]      anon = { anon_2 }
[debug/grammar]      anon_l1 = { anon_2 }
[debug/grammar]      anon_l2 = { anon_2 }
[debug/grammar]      foo_X = { anon_2, x }
[debug/grammar]
[debug/grammar]   -- Follow:
[debug/grammar]      anon = { x }
[debug/grammar]      anon_l1 = { x }
[debug/grammar]      anon_l2 = { x }
[debug/grammar]      foo_X = {  }
[debug/grammar]
```

In above debug output the entry point of the grammar is marked `(*)`.

- parsing a unit consists of parsing the `anon` field (corresponding to the
  anonymous list), and `x`
- to parse the list lookahead is used.
- lookahead inspects a `uint8` (as epsilon) or literal `b"A"`

## Types for lookahead

In addition to literals, lookahead also works with units which start with a
literal. Spicy transparently detects such units and will use them for
lookahead if possible.

```admonish example
Confirm this yourself by wrapping the literal in above unit in its own unit, and
validating by parsing an input like `AAAAA\x01`. Are there any major differences
in the generated grammar?
```

## Using lookahead for conditional parsing

We have seen previously how we can use unit `switch` for conditional parsing.
Another instance of conditional parsing occurs when a protocol message
holds one of multiple possible sub-messages (a *union*). The sub-messages often
contain a tag to denote what kind of sub-message is transmitted.

With a unit `switch` statement we could model this like so.

```spicy
public type X = unit {
    tag: uint8;
    switch (self.tag) {
        1 -> m1: Message1;
        2 -> m2: Message2;
        * -> : skip bytes &eod; # For unknown message types simply consume all data.
    };
};

type Message1 = unit {
    payload: bytes &eod;
};

type Message2 = unit {
    payload: bytes &eod;
};
```

The unit `switch` statement has a form without control variable which instead
uses lookahead. With this we can push parsing of the `tag` variable into the
units concerned with the particular messages so we keep all pieces related to a
particular message together.

```spicy
public type X = unit {
    switch {
        -> m1: Message1;
        -> m2: Message2;
        -> : skip bytes &eod; # For unknown message types, simply consume all data.
    };
};

type Message1 = unit {
    : skip uint8(1);
    payload: bytes &eod;
};

type Message2 = unit {
    : skip uint8(2);
    payload: bytes &eod;
};
```

```admonish example
Do the generated grammars for above two ways to express the protocol differ?
```
