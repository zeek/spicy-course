# Controlling byte order

The used [byte
order](https://docs.zeek.org/projects/spicy/en/latest/programming/library.html#types)
can be controlled on the
[module](https://docs.zeek.org/projects/spicy/en/latest/programming/language/modules.html#global-properties),
[unit](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#unit-attributes),
or
[field](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#integer)
level.

```spicy
# The 'ByteOrder' type is defined in the built-in Spicy module.
import spicy;

# Switch default from default network byte order to little for this module.
%byte-order=spicy::ByteOrder::Little;

# This unit uses big byte order.
type X = unit {
    # Use default byte order (big).
    a: uint8;

    # Use little byte order for this field.
    b: uint8 &byte-order=spicy::ByteOrder::Little;
} &byte-order=spicy::ByteOrder::Big;
```
