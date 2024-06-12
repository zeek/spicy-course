# Boolean and integers

## Boolean

[Booleans](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#bool)
have two possible values: `True` or `False`.

```spicy
global C = True;

if (C)
    print "always runs";
```

## Integers

Spicy supports both signed and unsigned integers with widths of 8, 16, 32 and
64 bits:

- `uint8`, `uint16`, `uint32`, `uint64`
- `int8`, `int16`, `int32`, `int64`

Integers are checked at both compile and runtime against overflows. They are
either statically rejected or trigger runtime exceptions.

Integer literals without sign like e.g., `4711` default to `uint64`; if a sign
is given `int64` is used, e.g., `-47`, `+12`.

If permitted integer types convert into each other when required; for cases
where this is not automatically possible one can explicitly `cast` integers to
each other:

```spicy
global a: uint8 = 0;
global b: uint64 = 1;

# Modify default: uint8 + uint64 -> uint64.
global c: uint8 = a + cast<uint8>(b);
```
