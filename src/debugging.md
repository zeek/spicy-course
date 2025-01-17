# Debugging

We need to debug runtime behavior of parsers both during development as well as
in production. This chapter gives an overview of the available tools.

<!-- ```admonish example -->
In following we use a Zeek protocol analyzer for the
[TFTP](https://en.wikipedia.org/wiki/Trivial_File_Transfer_Protocol) protocol
[`zeek/spicy-tftp`](https://github.com/zeek/spicy-tftp) as test environment.
To have access to its sources let's install it from a local clone.

Create and switch to a local clone of the parser at version `v0.0.5`:

``` console
git clone https://github.com/zeek/spicy-tftp -b v0.0.5
cd spicy-tftp/
```

Briefly familiarize yourself with the parser.

1. Looking at its EVT file `analyzer/tftp.evt`, what traffic does the analyzer trigger on?
   <details>
   <summary>Solution</summary>
   This is an analyzer for UDP traffic. It is triggered for UDP traffic on port 69.

   ``` evt
   protocol analyzer spicy::TFTP over UDP:
       parse with TFTP::Packet,
       port 69/udp;
   ```

   </details>

1. Does this analyzer perform dynamic protocol detection (DPD)?

    <details>
    <summary>Solution</summary>

    No, no DPD signatures are loaded (`@load-sig`) in any of its Zeek scripts in e.g., `scripts/`.
    </details>

1. When in the connection lifecycle does this analyzer invoke `spicy::accept_input()` (or `zeek::confirm_input` for older versions)?

   <details>
   <summary>Solution</summary>

   For each received message in `Request` in `analyzer/tftp.spicy`:

   ```ruby
   type Request = unit(is_read: bool) {
       # ...
       on %done { spicy::accept_input(); }
   };
   ```

   </details>

1. How does this analyzer behave on parse errors?

   <details>
   <summary>Solution</summary>

   The analyzer does not seem to perform resynchronization (no `&synchronize`
   anywhere in its sources). It should report an analyzer violation on parse
   errors.
   </details>

1. Which Zeek events does the Spicy parser raise?

   <details>
   <summary>Solution</summary>

   ``` evt
   on TFTP::Request if ( is_read )   -> event tftp::read_request($conn, $is_orig, self.filename, self.mode);
   on TFTP::Request if ( ! is_read ) -> event tftp::write_request($conn, $is_orig, self.filename, self.mode);

   on TFTP::Data            -> event tftp::data($conn, $is_orig, self.num, self.data);
   on TFTP::Acknowledgement -> event tftp::ack($conn, $is_orig, self.num);
   on TFTP::Error           -> event tftp::error($conn, $is_orig, self.code, self.msg);
   ```

   </details>

1. Which logs does the analyzer provide? What are its content? Try to look at
   only the sources and ignore files under `testing` for this.

   <details>
   <summary>Solution</summary>

   Grepping the analyzer sources for `create_stream` indicates that it produces a log `tftp.log`.

   ``` zeek
   Log::create_stream(TFTP::LOG, [$columns = Info, $ev = log_tftp, $path="tftp"]);
   ```

   The columns of the log are the fields of `TFTP::Info` marked `&log`.

   </details>
<!-- ``` -->

## Further reading

- [Debugging section in the Spicy documentation](https://docs.zeek.org/projects/spicy/en/latest/programming/debugging.html)
