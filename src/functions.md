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

```admonish warning
While this should work for user-defined types, this still is broken for some
builtin types, e.g., it [works for passing `string`
values](https://github.com/zeek/spicy/issues/674), but is [broken for
integers](https://github.com/zeek/spicy/issues/1583).

If support is broken, you need to return a modified copy (use a `tuple` if you
already return a value).
```
