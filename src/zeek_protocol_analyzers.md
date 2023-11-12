# Protocol analyzers

For a TCP protocol analyzer the template generated the following declaration in
`analyzer/*.evt`:

```evt
protocol analyzer Foo over TCP:
    parse originator with foo::Request,
    parse responder with foo::Response;
```

Here we declare a Zeek protocol analyzer `Foo` which uses to different parsers
for the originator (client) and responder (server) side of the connection,
`Request` and `Response`. To use the same parser for both sides we would declare

```evt
    parse with foo::Messages;
```
