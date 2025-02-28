# Conditional parsing

During parsing we often want to decide at runtime what to parse next, e.g.,
certain fields might only be set if a previous field has a certain value, or the
type for the next field might be known dynamically from a previous field.

We can [specify that a field should only be parsed if a condition is
met](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#conditional-parsing).

```spicy
type Integer = unit {
    width: uint8 &requires=($$ != 0 && $$ < 5);
    u8 : uint8  if (self.width == 1);
    u16: uint16 if (self.width == 2);
    u32: uint32 if (self.width == 3);
    u64: uint64 if (self.width == 4);
};
```

Alternatively we can express this with a [unit switch
statement](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#parse-switch).

```spicy
type Integer = unit {
    width: uint8 &requires=($$ != 0 && $$ < 5);
    switch (self.width) {
        1 -> u8: uint8;
        2 -> u16: uint16;
        3 -> u32: uint32;
        4 -> u64: uint64;
    };
};
```

In both cases the unit will include all fields, both set and unset. Once can
query whether a field has been set with
[`?.`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#operator-unit::HasMember),
e.g.,

```spicy
on Integer::%done {
    if (self?.u8) { print "u8 was extracted"; }
}
```

Often parsing requires examining input and dynamically choosing a matching
parser from the input. Spicy models this with lookahead parsing which is
explained in a separate section.
