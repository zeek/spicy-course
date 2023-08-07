# Optional

[Optionals](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#optional)
either contain a value or nothing. They are a good choice when one wants to
denote that a value can be absent.

`optional` is a parametric (also sometimes called generic) type in that it
wraps a value of some other type.

```spicy
global opt_set1 = optional(4711);
global opt_set2: optional<uint64> = 4711;

global opt_unset: optional<uint64>;
```

Optionals implicitly convert to booleans. This can be used to check whether
they are set.

```spicy
assert opt_set1;
assert ! opt_unset;
```

Assigning `Null` to an optional empties it.

```spicy
global x = optional(4711);
assert x;
x = Null;
assert ! x;
```

To extract the value contained in an `optional` dereference it with the `*` operator.

```spicy
global x = optional(4711);
assert *x == 4711;
```
