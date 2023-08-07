# Variables

Variables in Spicy can either be declared at _local_ or module (_global_)
scope.

Local variables live in bodies of [functions](./functions.md). They are
declared with the `local` storage qualifier and always mutable.

```spicy
function hello(name: string) {
    local message = "Hello, %s" % name;
    print message;
}
```

Global variables live at module scope. If declared with `global` they are
mutable, or immutable if declared with `const`.

```spicy
module foo;

global N = 0;
N += 1;

const VERSION = "0.1.0";
```
