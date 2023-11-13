# Collections

## Tuples

[Tuples](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#tuple)
are heterogeneous collections of values. Tuple values are immutable.

```spicy
global xs = (1, "a", b"c");
global ys = tuple(1, "a", b"c");
global zs: tuple<uint64, string, bytes> = (1, "a", b"c");
print xs, ys, zs;
```

Individual tuple elements can be accessed with subscript syntax.

```spicy
print (1, "a", b"c")[1];  # Prints "a".
```

Optionally individual tuple elements can be named, e.g.,

```spicy
global xs: tuple<first: uint8, second: string> = (1, "a");
assert xs[0] == xs.first;
assert xs[1] == xs.second;
```

## Containers

Spicy provides data structures for lists
([`vector`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#vector)),
and associative containers
([`set`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#set),
[`map`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#map)).

The element types can be inferred automatically, or specified explicitly. All
of the following forms are equivalent:

```spicy
global a1 = vector(1, 2, 3);
global a2 = vector<uint64>(1, 2, 3);
global a3: vector<uint64> = vector(1, 2, 3);

global b1 = set(1, 2, 3);
global b2 = set<uint64>(1, 2, 3);
global b3: set<uint64> = set(1, 2, 3);

global c1 = map("a": 1, "b": 2, "c": 3);
global c2 = map<string, uint64>("a": 1, "b": 2, "c": 3);
global c3: map<string, uint64> = map("a": 1, "b": 2, "c": 3);
```

All collection types can be iterated.

```spicy
for (x in vector(1, 2, 3)) {
    print x;
}

for (x in set(1, 2, 3)) {
    print x;
}

# Map iteration yields a (key, value) `tuple`.
for (x in map("a": 1, "b": 2, "c": 1)) {
    print x, x[0], x[1];
}
```

Indexing into collections and iterators is checked at runtime.

Use `|..|` like in Zeek to obtain the number of elements in a collection, e.g.,

```spicy
assert |vector(1, 2, 3)| == 3;
```

To check whether a `set` or `map` contains a given key use the `in` operator.

```spicy
assert 1 in set(1, 2, 3);
assert "a" in map("a": 1, "b": 2, "c": 1)
```
