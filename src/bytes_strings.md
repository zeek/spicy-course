# Bytes and strings

The [`bytes`
type](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#bytes)
represents raw bytes, typically from protocol data. Literals for `bytes` are
written with prefix `b`, e.g., `b"\x00byteData\x01"`.

The [`string`
type](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#string)
represents text in a given character set.

Conversion between `bytes` and `string` are always explicit, via [`bytes`'
`decode`
method](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#method-bytes::decode)
or [`string`'s
`encode`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#method-string::encode),
e.g.,

```spicy
global my_bytes = b"abc";
global my_string = "abc";
global my_other_string = my_bytes.decode(); # Default: UTF-8.

print my_bytes, my_string, my_other_string;
```

`bytes` can be iterated over.

```spicy
for (byte in b"abc") {
    print byte;
}
```

Use the [format operator
`%`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#operator-string::Modulo)
to compute a string representation of Spicy values. Format strings roughly follow the
[POSIX format string
API](https://pubs.opengroup.org/onlinepubs/9699919799/functions/strftime.html).

```spicy
global n = 4711;
global s = "%d" % n;
```

The format operator can be used to format multiple values.

```spicy
global start = 0;
global end = 1024;
print "[%d, %d)" % (start, end);
```
