# Passing data to Zeek

Ultimately we want to make the parsed data available to Zeek for analysis and
logging.

The handling of events is declared in the EVT file `analyzer/*.EVT`.

```spicy
# TODO: Connect Spicy-side events with Zeek-side events. The example just
# defines simple example events that forwards the raw data (which in practice
# you don't want to do!).
on Foo::Request -> event Foo::request($conn, $is_orig, self.payload);
on Foo::Response -> event Foo::reply($conn, $is_orig, self.payload);
```

- the LHS specifies a Spicy hook in Spicy syntax
- the RHS specifies a (possibly generated) Zeek event in Zeek syntax
- we can reference Spicy data via `self` on the RHS
- data for builtin Spicy types are [converted
  automatically](https://docs.zeek.org/en/master/devel/spicy/reference.html#event-definitions)
  to equivalent Zeek types
- we can [automatically generate Zeek record types from Spicy
  types](https://docs.zeek.org/en/master/devel/spicy/reference.html#exporting-types)
- information about the generated analyzer is accessible via [magic
  variables](https://docs.zeek.org/en/master/devel/spicy/reference.html#event-definitions)
  `$conn`, `$file`, `$packet`, `$is_orig`

The event is handled on the Zeek side in `scripts/main.zeek`, e.g.,

```zeek
# Example event defined in foo.evt.
event Foo::request(c: connection, is_orig: bool, payload: string)
    {
    hook set_session(c);

    local info = c$foo;
    info$request = payload;
    }
```

Passing data to other Zeek analyzers (e.g., for analyzing subprotocols and
files) is handled in a later section.
