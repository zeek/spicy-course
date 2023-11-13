# Message and connection semantics: UDP vs. TCP

The parsers have these stub implementations:

```spicy
module foo;

public type Request = unit {
    payload: bytes &eod;
};

public type Response = unit {
    payload: bytes &eod;
};
```

We have used `&eod` to denote that we want to extract _all data_. The semantics
of _all data_ differ between TCP and UDP parsers:

- **UDP** has no connection concept so Zeek synthesizes UDP "connections" from flows by
  grouping UDP messages with the same
  [5-tuple](https://docs.zeek.org/en/master/scripts/base/init-bare.zeek.html#type-conn_id)
  in a time window. UDP has no reassembly, so a new parser instance is
  created for each UDP packet; `&eod` means _until the end of the current
  packet_.
- **TCP**: TCP supports connections and packet reassembly, so both sides of a
  connection are modelled as streams with reassembled data; `&eod` means _until
  the end of the stream_. The stream is _unbounded_.

For this reason one usually wants to model parsing of a TCP connection as a list of
protocol messages, e.g.,

```spicy
public type Requests = unit {
    : Request[];
};

type Request = unit {
    # TODO: Parse protocol message.
};
```

- the length of the list of messages is unspecified so it is detected dynamically
- to avoid storing an unbounded list of messages we use an [anonymous
  field](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#anonymous-fields)
  for the list
- parsing of the protocol messages is responsible for detecting when a message
  ends
