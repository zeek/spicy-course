# Modules revisited

Every Spicy file specifies the
[module](https://docs.zeek.org/projects/spicy/en/latest/programming/language/modules.html)
it declares.

```spicy
module foo;
```

Other modules can be imported with the [`import`
keyword](https://docs.zeek.org/projects/spicy/en/latest/programming/language/statements.html#import).

Typically, to refer to a type, function or variable in another module, it needs
to be declared public.

```spicy
# file: foo.spicy
module foo;

public global A = 47;
public const B = 11;
const C = 42;
```

```spicy
# file: bar.spicy
module bar;

import foo;

print foo::A, foo::B;

# Rejected: 'foo::C' has not been declared public
# print foo::C;
```

```admonish hint
Declaring something `public` makes it part of the external API of a module.
This makes certain optimizations inapplicable (e.g., dead code removal).

Only declare something `public` if you intend it to be used by other modules.
```

```admonish note
With spicy-1.11 (shipping with zeek-7) the rules around `public` are much more
relaxed and `public` even closer maps onto "exposed C++ API". Above example use
of a non-`public` `const` would be accepted.
```
