# Structure of a parser

A parser contains a potentially empty ordered list of subparsers which are
invoked in order.

```spicy
type Version = unit {
    major: uint32;
    minor: uint32;
    patch: uint32;
};
```

```plain
#   4 bytes   4 bytes   4 bytes
#  -----------------------------
# |  Major  |  Minor  |  Patch  |
#  -----------------------------
#
#   Figure 47-11: Version packet
```
