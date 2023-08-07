# Conditionals and loops

## Conditionals

### `if`/`else`

Spicy has [`if`
statements](https://docs.zeek.org/projects/spicy/en/latest/programming/language/statements.html#if)
which can optionally contain `else` branches.

```spicy
global x: uint64 = 4711;

if (x > 100) {
    print "%d > 100" % x;
} else if (x > 10) {
    print "%d > 10" % x;
} else if (x > 1) {
    print "%d > 1" % x;
} else {
    print x;
}
```

```admonish hint
Surrounding bodys with `{..}` is optional, but often makes code easier to follow.
```

### `switch`

To match a value against a list of possible options [`switch`
statement](https://docs.zeek.org/projects/spicy/en/latest/programming/language/statements.html#switch)
can be used.

```spicy
type Flag = enum {
    OFF = 0,
    ON = 1,
};

global flag = Flag::ON;

switch (flag) {
    case Flag::ON: print "on";
    case Flag::OFF: print "off";
    default: print "???";
}
```

In contrast to its behavior in e.g., C, in Spicy

- there is no fall-through in `switch`, i.e., there is an implicit `break`
  after each `case`,
- `switch` cases are not restricted to literal integer values; they can contain
  any expression,
- if no matching `case` or `default` is found, a runtime error is raised.

## Loops

Spicy offers two loop constructs:

- [`for`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/statements.html#if)
  for loops over collections
- [`while`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/statements.html#while)
  for raw loops

```spicy
global xs = vector("a", "b", "c");

for (x in xs)
    print x;
```

```spicy
global i = 0;

while (i < 3) {
    print i;
    ++i;
}
```
