# Adding additional parser state

We might want to add additional state to parsers, e.g.,

- share or modify data outside of our parser, or
- to locally aggregate data while parsing.

Sharing state across multiple units in the same Zeek connection with [unit
contexts](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#contexts)
will be discussed separately in a later section.

## Passing outside state into units

We might want to pass additional state into a unit, e.g., to parameterize the
unit's behavior, or to give the unit access to external state. This can be
accomplished with [unit
parameters](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#unit-parameters).

```spicy
type X = unit(init: uint64 = 64) {
    var sum: uint64;

    on %init { self.sum = init; }

    : uint8 { self.sum += $$; }
    : uint8 { self.sum += $$; }
    : uint8 { self.sum += $$; }

    on %done { print self.sum; }
};
```

A few things to note here:

- Unit parameter look a lot like function parameters to the unit.
- Unit parameters can have default values which are used if the parameter was not passed.
- We refer to unit parameters by directly using their name; `self` is not used.

Unit parameters can also be used to give a unit access to its parent units and
their state.

```spicy
public type X = unit {
    var sum: uint8;

    : (Y(self))[];
};

type Y = unit(outer: X) {
    : uint8 { outer.sum += $$; }
};
```

## Unit variables

[Unit
variables](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#unit-variables)
allow to add additional data to units. Their data can be accessed like other
unit fields.

```spicy
type X = unit {
    var sum: uint8;

    : uint8 { self.sum += $$; }
    : uint8 { self.sum += $$; }
    : uint8 { self.sum += $$; }

    on %done { print self.sum; }
};
```

By default unit variables are initialized with the default value of the type,
e.g., for a `uint8` with `0`.

```admonish info
If you want to capture whether a unit variable (or any other variable) was set,
use a variable of `optional` type instead of a dummy value.
```

To use with a different value, assign the variable in the unit's `%init` hook,
e.g.,

```spicy
on %init { self.sum = 100; }
```
