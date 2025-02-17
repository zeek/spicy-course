# Collect data for channel membership analysis

> Create a Zeek log with entries for whenever a user attempts to join a channel (ts, user, channel)

## Notes

Zeek already has a builtin IRC analyzer which we need to replace, add the
following to your analyzer definition in the EVT file

```evt
replaces IRC
```

*Do not* call your analyzer or package `IRC` to avoid name collisions on the
analyzer or Zeek script level.

<details>
<summary>Sketch of possible solution</summary>

There are multiple levels to this:

- create a new analyzer which can parse IRC `JOIN` instructions
- pass the required information to Zeek via a Zeek event
- create a Zeek log containing the requested information

By searching we can find out that the relevant spec is
[RFC1459](https://www.rfc-editor.org/rfc/rfc1459). Searching the web for a test
PCAP containing this traffic is a little harder, but we can e.g., find a PCAP
with IRC `JOIN` in the Zeek test suite
[here](https://github.com/zeek/zeek/blob/65a79b1dec9e198577a0763311eeeafd29ec6efe/testing/btest/Traces/irc-basic.trace);
if we cannot find existing traffic we could install an IRC client and server on
our own machine and capture the traffic we are trying to parse.

Overall, IRC is a text based format where individual messages are separated by
`\r\n`; individual message fields for the command and its arguments are
separated by single spaces ``. Every command can start with an optional prefix
identifying the user which can be recognized from starting with `:`. The `JOIN`
messages we need to parse have the following format:

```plain
[prefix] JOIN <channel>{,<channel>} [<key>{,<key>}]\r\n
```

A simplistic parser extracting any message could look like this:

```spicy
module irc;

import spicy;

public type Messages = unit {
    : Message[];
};

type Message = unit {
    var prefix: optional<bytes>;
    var command: bytes;
    var args: vector<bytes>;

    # For simplicity for now only consume lines and split them manually after
    # parsing. "Proper parsing" could be done with e.g., lookahead parsing.
    : bytes &until=b"\r\n" &convert=$$.split(b" ") {
        assert |$$| >= 2 : ("expected at least 2 parts for IRC message, got %d" % |$$|);

        local idx = 0;

        # Check for presence of prefix.
        if ($$[0].starts_with(b":")) {
            # Strip away prefix indicator `:` so we can interpret prefix as a username.
            self.prefix = $$[idx].strip(spicy::Side::Left, b":");
            ++idx;
        }

        # Due to above `assert` we always have a command.
        self.command = $$[idx];
        ++idx;

        self.args = $$.sub(idx, |$$|);
    }
};
```

To get this data into Zeek for logging we could use the following in the EVT
file of the analyzer:

```evt
on irc::Message if (self.command == b"JOIN") -> event irc::join($conn, self.prefix, self.args.split(b" "));
```

Even though we have parsed a generic message we can tie it to a Zeek event for
`JOIN` messages by conditionally raising the event for `JOIN` messages. This
creates a Zeek event with the signature

```zeek
event irc::join(c: connection, prefix: string, args: vector of string) {}
```

where `prefix` might be an empty string (no prefix present) or contain a
username, and `args` would need Zeek-side processing to extract the channels
(split first arg at `,`).

</details>
