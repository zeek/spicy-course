# Error recovery

Even with a grammar perfectly modelling a specification, parsing of real data can
fail due to e.g.,

- endpoints not conforming to spec, or
- gaps in the input data due to capture loss.

Instead of altogether aborting parsing we would like to gracefully recover from
parse errors, i.e., when the parser encounters a parse error we would like skip
input until it can parse again.

Spicy includes [support for expressing such
recovery](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#error-recovery)
with the following model:

1. To resynchronize the input potential synchronization points are annotated, e.g., to
   synchronize input at the sequence `b"POST"` the grammar might contain a field

   ```spicy
   : b"POST" &synchronize;
   ```

   All constructs supporting lookahead parsing can be synchronization points,
   e.g., literals or fields with `unit` type with a literal at a fixed offset.

1. On a parse error the unit enters a synchronization trial mode.

   Once the input could be synchronized a [`%synced`
   hook](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#error-recovery-hooks)
   is invoked. The implementation of the hook can examine the data up to the
   `&synchronize` field, and either
   [`confirm`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/statements.html#statement-confirm)
   it to leave trial mode and continue normal parsing, or
   [`reject`](https://docs.zeek.org/projects/spicy/en/latest/programming/language/statements.html#statement-reject)
   it to look for a later synchronization point.

## Exercises

Let's assume we are parsing a protocol where valid messages are _always_ the
sequence `AB`, i.e., a the byte sequence `b"AB"`. We will use the following
contrived grammar:

```spicy
module foo;

public type Messages = unit {
    : Message[];
};

type Message = unit {
    a: b"A";
    b: b"B";
};

on Message::%done { print self; }
```

1. Validate that this grammar can parse the input

   ```plain
   ABABAB
   ```

   ```plain
   $ printf ABABAB | spicy-driver %
   [$a=b"A", $b=b"B"]
   [$a=b"A", $b=b"B"]
   [$a=b"A", $b=b"B"]
   ```

   ```admonish info
   We used `printf` to avoid inserting a newline which our grammar does not
   expect.
   ```

1. What do you see if you pass misspelled input, like with the second `A` changed
   to `1`, i.e., the input

   ```plain
   AB1BAB
   ```

   Why is this particular source range shown as error location?

   <details>
   <summary>Solution</summary>

   ```plain
   [$a=b"A", $b=b"B"]
   [error] terminating with uncaught exception of type spicy::rt::ParseError: no expected look-ahead token found (foo.spicy:3:30-4:17)
   ```

   We first the result of parsing for the first `Message` from `AB`, and
   encounter an error for the second element.

   The error corresponds to parsing the list inside `Messages`. The grammar
   expects either `A` to start a new `Message`, or end of data to signal the end of
   the input; `1` matches neither so lookahead parsing fails.
   </details>

1. What are the potential synchronization points in this grammar we could use so we can extract
   the remaining data?

   <details>
   <summary>Solution</summary>

   In this case parsing failed at the first field of `Message`, `Message::a`. We
   could

   a. synchronize on `Message::b` by changing it to

      ```spicy
      b: b"B" &synchronize;
      ```

   b. Synchronize on `Message::a` in the _next message_, i.e., abandon parsing
      the remaining fields in `Message` and start over. For that we would synchronize on the list elements in `Messages`,

      ```spicy
      : (Message &synchronize)[];
      ```

   ```admonish info
   A slight modification of this grammar seems to fail to synchronize and run
   into an edge case, <https://github.com/zeek/spicy/issues/1594>.
   ```

   </details>

1. If you had to choose one, which one would you pick? What are the trade-offs?

   <details>
   <summary>Solution</summary>

   - If we synchronize on `Message::b` it would seem that we should be able to recover at its data.

     This however does not work since the list uses lookahead parsing, so we
     would fail already in `Messages` before we could recover in `Message`.

   - We need to synchronize on the next list element.

     In larger units synchronizing high up (e.g., on a list in the top-level
     unit) allows recovering from more general errors at the cost of not
     extracting some data, e.g., we would be able to also handle misspelled `B`s
     in this example.
   </details>

1. Add a single `&synchronized` attribute to the grammar so you can handle all
   possible misspellings. Also add a `%synced` hook to confirm the
   synchronization result (on which unit). Can you parse inputs like

   ```plain
   ABABAB
   AB1BAB
   A11BAB
   ```

   You can enable the `spicy-verbose` debug stream to show parsing progress.

   ```console
   echo AB1BAB | HILTI_DEBUG=spicy-verbose spicy-driver -d foo.spicy
   ```

   <details>
   <summary>Solution</summary>

   ```spicy
   module foo;

   public type Messages = unit {
       : (Message &synchronize)[];
   };

   type Message = unit {
       a: b"A";
       b: b"B";
   };

   on Message::%done { print self; }
   on Messages::%synced { confirm; }
   ```

   </details>
