# Forwarding to other analyzers

One often wants to forward an extracted payload to other analyzers.

- HTTP messages with files
- compressed files containing PE files
- protocols using other sub-protocols

Inside Spicy we can forward data from one parser to another one with [`sink`
values](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#sinks),
but in a Zeek context we can also forward data to other analyzers (Spicy or
not).

## Forwarding to file analyzers

Let's assume we are parsing protocol messages which contain `bytes`
corresponding to a file. We want to feed the file data into Zeek's file
analysis.

```spicy
type Message = unit {
    : bytes &chunked &size=512;
};
```

By using the `&chunked` attribute on the `bytes` its field hook is invoked soon as a chunk of data
arrives, even if the full data is not yet available.
The caveat is that only the final chunk will be stored parsing is done. This is
fine since we usually do not store the data.

The protocol for passing data is:

- open a handle for a new Zeek file with [`zeek::file_begin`](https://docs.zeek.org/en/master/devel/spicy/reference.html#spicy-file-begin) optionally specifying a MIME type
- pass information to Zeek, e.g., [feed](https://docs.zeek.org/en/master/devel/spicy/reference.html#spicy-file-data-in) [data](https://docs.zeek.org/en/master/devel/spicy/reference.html#spicy-file-data-in-at-offset) or [gaps](https://docs.zeek.org/en/master/devel/spicy/reference.html#spicy-file-gap), or [notify Zeek about the expected size](https://docs.zeek.org/en/master/devel/spicy/reference.html#spicy-file-set-size)
- close the handle with [`zeek::file_end`](https://docs.zeek.org/en/master/devel/spicy/reference.html#spicy-file-end)

E.g.,

```spicy
import zeek;

public type File = unit {
    var fh: string;

    on %init { self.h = zeek::file_begin(); }

    : bytes &chunked &eod {
        zeek::file_data_in($$, self.h);
    }

    on %done { zeek::file_end(self.h); }
};
```

```admonish danger
File handles need to be closed explicitly.

Not closing them would leak them for the duration of the connection.
```

## Forwarding to protocol analyzers

Forwarding to protocol analyzers follows a similar protocol of opening a handle,
interacting with it, and closing it.

```admonish danger
Protocol handles need to be closed explicitly.
```

For opening a handle, two APIs are supported:

```spicy
function zeek::protocol_begin(analyzer: optional<string> = Null);
function zeek::protocol_handle_get_or_create(analyzer: string) : ProtocolHandle;
```

When using `zeek::protocol_begin` without argument all forwarded data will be
pass to Zeek's dynamic protocol detection (DPD).

Otherwise use the Zeek name of the analyzer, e.g.,

```spicy
local h = zeek::protocol_handle_get_or_create("SSL");
```

You can inspect the output of `zeek -NN` for available analyzer names, e.g.,

```console
$ zeek -NN | grep ANALYZER | grep SSL
    [Analyzer] SSL (ANALYZER_SSL, enabled)
```
