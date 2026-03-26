# Functions

[Functions in
Spicy](https://docs.zeek.org/projects/spicy/en/latest/programming/language/functions.html#functions)
look like this:

```spicy
function make_string(x: uint8): string {
    return "%d" % x;
}
```

Functions without return value can either be written without return type, or
returning `void`.

```spicy
function nothing1() {}
function nothing2(): void {}
```

By default function arguments are passed as read-only references. To instead
pass a mutable value declare the argument `inout`.

```spicy
function barify(inout x: string) {
    x = "%s bar" % x;
}

global s = "foo";
assert s == "foo";
barify(s);
assert s == "foo bar";
```
