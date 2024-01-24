# Exercise

Starting from the default protocol analyzer template we want to (redundantly) pass the number of
`bytes` for `Request` to Zeek as well.

1. In the EVT file pass the number of `bytes` in `self.payload`.

   <details>
   <summary>Solution</summary>

   ```spicy
   on Foo::Request -> event Foo::request($conn, $is_orig, self.payload, |self.payload|);
   ```

   </details>

1. Manually build your changed analyzer:

    ```console
    mkdir build
    cd build/
    cmake ..
    make
    ```

1. Execute the test suite. This runs tests against an included PCAP file. What do you see?

   ```console
   cd testing/
   btest -dv
   ```

   <details>
   <summary>Solution</summary>

   Test `tests.trace` test fails. Its sources are in `testing/tests/trace.zeek`.

   ```plain
   .. analyzer error in <..>/foo/analyzer/foo.evt, line 16: Event parameter mismatch, more parameters given than the 3 that the Zeek event expects

   ```

   </details>

1. Fix the signatures of the handlers for `Foo::request` so tests pass. What
   type do need to use on the Zeek side to pass the length (`uint64` in Spicy)?

   <details>
   <summary>Hint</summary>

    The type mappings are documented
    [here](https://docs.zeek.org/en/master/devel/spicy/reference.html#id1).
   </details>

   <details>
   <summary>Solution</summary>

   In both `testing/tests/trace.zeek` and `scripts/main.zeek` change the signatures to

   ```zeek
   event Foo::request(c: connection, is_orig: bool, payload: string, len: count) {}
   ```

   </details>

1. Modify `testing/tests/trace.zeek` to include the length in the baseline,
   i.e., change the test case for `Foo::request` to

   ```zeek
   print fmt("Testing Foo: [request] %s %s %d", c$id, payload, len);
   ```

   Rerun tests and update the test baseline with

   ```console
   cd testing/
   btest -u
   ```

   Make sure all tests pass with these changes.

   Stage and commit all changes in the package repository.

   ```console
   git add -u
   git commit -v -m "Pass payload length to Zeek"
   ```

   Validate that the package also tests fine with `zkg`. This will require no
   uncommitted changes or untracked files in the repository.

   ```console
   # Make progress more verbose.
   zkg -vvv test .
   ```

1. **Optional** Also add the length to the Zeek log generated from the code in
`scripts/main.zeek`.

   <details>
   <summary>Hint</summary>

   This requires adding a `count &optional &log` field to the `Info` record.

   Set the field from the event handler for `Foo::request`.

   Update test baselines as needed.
   </details>
