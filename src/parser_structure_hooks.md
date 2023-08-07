# Hooks

We can hook into parsing via [unit or field hooks](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#unit-hooks).

In hooks we can refer to the current unit via `self`, and the current field via
`$$`. We can declare multiple hooks for the same field/unit, even in multiple
files.

```spicy
public type X = unit {
    x: uint8 { print "a=%d" % self.x; }

    on %done { print "X=%s" % self; }
};

on X::x {
    print "Done parsing a=%d" % $$;
}
```
