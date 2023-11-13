# Attributes

The behavior of individual subparsers or units can be controlled with attributes.

```spicy
type Version = unit {
    major: bytes &until=b".";
    minor: bytes &until=b".";
    patch: bytes &eod;
} &convert="v%s.%s.%s" % (self.major, self.minor, self.patch);
```

There are a wide range of both generic and type-specific attributes, e.g.,

- the
  [`&size`](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#parsing-fields-with-known-size)
  and
  [`&max-size`](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#defensively-limiting-input-size)
  attributes to control how much data should be parsed,
- attributes [`&parse-from` and
  `&parse-at`](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#changing-input)
  allowing to change where from where data is parsed,
- [`&convert`](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#on-the-fly-type-conversion-with-convert)
  to transform the value and/or type of parsed data, or
- [`&requires`](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#enforcing-parsing-constraints) to enforce post conditions.

Type-specific attributes are [documented together with their type](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#parsing-types).
