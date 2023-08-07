# Parsing types

Spicy parsers are build up from smaller parsers, at the lowest level from basic
types present in the input.

Currently Spicy [supports parsing for the following basic
types](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#parsing-types):

- [network
  addresses](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#address)
- [bitfields](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#bitfield)
- [raw bytes](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#bytes)
- [integers](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#integer)
- [floating point
  numbers](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#real)
- [regular expressions](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#regular-expression)
- [lists](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#vector)

Fields not extracting any data can be marked `void`. They can still have hooks attached.

Since they are pervasive we give a brief overview for lists here.

## Parsing lists

A common requirement is to [parse lists of the same
type](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#vector),
possibly of dynamic length.

To parse a list of three integers we would write:

```spicy
type X = unit {
    xs: uint16[3];
};
```

If the number of elements is not known we can parse until the end of the input
data. This will trigger a parse error if the input does not contain enough data
to parse all elements.

```spicy
type X = unit {
    xs: uint16[] &eod;
};
```

If the list is followed by e.g., a literal we can dynamically detect with
lookahead parsing where the list ends. The literal does not need to be a
field, but could also be in another parser following the list.

```spicy
type X = unit {
    xs: uint16[];
      : b"\x00"; # List is terminated with null byte.
};
```

If the terminator is in the domain of the list elements we can also use the
`&until` attribute.

```spicy
type X = unit {
    # List terminate with a null value
    xs: uint8[] &until=$$==0;
};
```

If the list elements require attributes themselves, we can pass them by grouping
them with the element type.

```spicy
type X = unit {
    # Parse a list of 4-byte integers less than 1024 until we find a null.
    xs: (uint64 &requires=$$<1024)[] &until=$$==0;
};
```
