# Sensitive messages

> Raise a notice if we see a message which contains any word from a list of
> trigger words. The notice should contain the username and the message.

1. In the first iteration just hardcode the list of words in your Spicy code.
1. In the final version we want to declare the list of keywords as a redef'able
   constant in a Zeek script so it can be changed without having to recompile
   the analyzer.

<details>
<summary>Sketch of possible solution</summary>

This task can be broken down into 1) detecting whether a seen IRC message and
2) raising a Zeek event for such messages for logging a notice on the Zeek
side. On the EVT file this could like this:

```evt
# For simplicity we pass the full Message to Zeek, ideally we
# would only transfer required information.
on irc::Message if (zeek_irc::is_sensitive(self)) -> event irc::sensitive_message($conn, self);
```

Here the task to detect whether the message is "sensitive" is delegated to a
function in the Zeek-specific part of the parser in the `analyzer/zeek_*.spicy`
file (which by convention can use the Spicy's Zeek API so we can later pull the
list of trigger words from Zeek).

The function might initially look like the following if we followed the parsing
approach from the sketch above:

```spicy
public function is_sensitive(msg: irc::Message): bool {
    # As specified only `PRIVMSG` messages can contain sensitive data.
    if (msg.command != b"PRIVMSG")
        return false;

    # TODO: Make this configurable from Zeek.
    # NOTE: Using `local` variables for demonstration, a `global` or `const`
    #       would be clearer and likely also perform better since values
    #       would only be set once.
    local phrases = vector("foo", "bar", "baz");
    local num_phrases = |phrases|;

    # Assume `args[0]` are the recipients (users or channels), and
    # `args[1]` is the message.
    for (phrase in phrases) {
        if (msg.args[1].find(phrase)[0])
            return True;
    }

    # No sensitive phrase found.
    return False;
}
```

In order to obtain the values from Zeek we could declare a redef'able constant in the Zeek module's `export` section, e.g.,

```zeek
const sensitive_phrases = vector("foo", "bar", "baz") &redef;
```

To get these Zeek values into the Spicy code we could use methods from the
`zeek` module. With that we would have in the above

```spicy
local sensitive_phrases: ZeekVector = zeek::get_vector("irc::sensitive_phrases");
local num_phrases: uint64 = zeek::vector_size(sensitive_phrases);
```

Since phrases are not in a `vector` anymore but a `ZeekVector` we would need to
use a different approach to iterate them, e.g., a manually maintained index and
a `while` loop. To obtain a phrase with the right Spicy type from the
`ZeekVector` we would use something like to following to match.

```spicy
local phrase: bytes = zeek::as_string(zeek::vector_index(sensitive_phrases, idx));
```

</details>
