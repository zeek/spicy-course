# Extracting data without storing it

If one needs to extracted some data but does not need it one can declare an
[anonymous
field](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#anonymous-fields)
(without name) to avoid storing it. With `>=spicy-1.9.0` (`>=zeek-6.1.0`) one
additionally can explicitly [skip over input
data](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#skipping-input).

<!-- NOTE: Disabling highlighting here since when highlighting this as ruby the
regexp confuses the highlighter. -->
```plain
# Parser for a series of digits. When done parsing yields the extracted number.
type Number = unit {
    n: /[[:digit:]]+/;
} &convert=self.n;

public type Version = unit {
    major: Number;
    : b".";
    minor: Number;
    : skip b".";
    patch: Number;
};
```
