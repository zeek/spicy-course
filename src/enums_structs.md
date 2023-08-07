# User-defined types

Enums and structs are user-defined data types which allow to give data a
semantic meaning.

## Enums

[Enumerations](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#enum)
map integer values to a list of labels.

By default enum labels are numbered `0`, ...

```spicy
type X = enum { A, B, C, };
local b: X = X(1);  # `X::B`.
assert 1 == cast<uint64>(b);
```

One can override the default label numbering.

```admonish note
Providing values for either **all** or **no labels** tends to lead to more
maintainable code.
Spicy still allows providing values for only a subset of labels.
```

```spicy
type X = enum {
    A = 1,
    B = 2,
    C = 3,
};
```

By default enum values are initialized with the implicit `Undef` label.

```spicy
type X = enum { A, B, C, };
global x: X;
assert x == X::Undef;
```

If an enum value is constructed from an integer not corresponding to a label,
an implicit label corresponding the numeric value is used.

```spicy
type X = enum { A, B, C, };

global x = X(4711);
assert cast<uint64>(x) == 4711;
print x;  # `X::<unknown-4711>`.
```

## Structs

[Structs](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#struct)
are similar to tuples but mutable.

```spicy
type X = struct {
    a: uint8;
    b: bytes;
};
```

Structs are initialized with Zeek record syntax.

```spicy
global x: X = [$a = 1, $b = b"abc"];
```

Struct fields can be marked with an `&optional` attribute to denote optional
fields. The `?.` operator can be used to query whether a field was set.

```spicy
type X = struct {
    a: uint8;
    b: uint8 &optional;
    c: uint8 &optional;
};

global x: X = [$a = 47, $b = 11];
assert x?.a;
assert x?.b : "%s" % x;
assert ! x?.c : "%s" % x;
```

Additionally, one can provide a `&default` value for struct fields to denote a
value to use if none was provided on initialization. Fields with a `&default`
are always set.

```spicy
type X = struct {
    a: uint8;
    b: uint8 &default=11;
    c: bytes &optional &default=b"abc";
};

global x: X = [$a = 47];
assert x.b == 11;
assert x.c;
```
