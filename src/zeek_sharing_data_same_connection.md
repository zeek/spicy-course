# Sharing data across the same connection

We sometimes want to correlate information from the originator and responder side of
a connection, and need to share data across the same connection.

Often we can do that in Zeek script land, e.g.,

```zeek
# Example: Mapping of connections to their request method.
#
# NOTE: FOR DEMONSTRATION ONLY. WE MIGHT E.G., WANT TO ALLOW MULTIPLE REQUESTS
# PER CONNECTION.
global methods: table[conn_id] of string &create_expire=10sec;

event http_request(c: connection, method: string, original_URI: string, unescaped_URI: string, version: string)
    {
    # Store method for correlation.
    methods[c$conn$id] = method;
    }

event http_reply(c: connection, version: string, code: count, reason: string)
    {
    local id = c$conn$id;

    if ( id in methods )
        {
        local method = methods[id];
        print fmt("Saw reply %s to %s request on %s", code, method, id);
        }
    else
        {
        print fmt("Saw reply to unseen request on %s", id);
        return;
        }
    }
```

```admonish warning
This assumes that we always see requests before replies. Depending how we
collect and process data this might not always hold.
```

If we need this information during parsing this is too late. Spicy allows
sharing information across both sides with [unit
contexts](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#contexts).
When declaring a Spicy analyzer Zeek automatically sets up so originator and
responder of a `connection` share a context.

```spicy
type Context = tuple<method: string>;

type Request = unit {
    %context = Context;

    method: /[^ \t\r\n]+/ { self.context().method = $$; }

    # ...
};

type Reply = unit {
    %context = Context;
    # ...

    on %done { print "Saw reply %s to %s request" % (code, self.context().method); }
};
```

```admonish warning
If we see `Reply` before `Request` `method` will default to an empty string.
```
