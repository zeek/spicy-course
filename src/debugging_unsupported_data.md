# Exercise: Input not matching parser grammar

The PCAP [`tftp-unsupported.pcap`](data/tftp-unsupported.pcap) contains TFTP
traffic, but there are problems. Using just the logs produced by Zeek figure
out what is the issue.

1. Make sure you have the package
   [`zeek/spicy-tftp`](https://github.com/zeek/spicy-tftp/) in version `v0.0.5` installed, its
   analyzer `spicy_TFTP` is working, and the package scripts are loaded.

   <details>
   <summary>Hint</summary>

   The package should be listed `zkg`, e.g.,

   ```console
   $ zkg list
   zeek/zeek/spicy-tftp (installed: v0.0.5) - Spicy-based analyzer for the TFTP protocol.
   ```

   Otherwise install it with

   ```console
   $ zkg install zeek/spicy-tftp --version v0.0.5
   The following packages will be INSTALLED:
     zeek/zeek/spicy-tftp (v0.0.5)

   Proceed? [Y/n]
   Running unit tests for "zeek/zeek/spicy-tftp"
   Installing "zeek/zeek/spicy-tftp".
   Installed "zeek/zeek/spicy-tftp" (v0.0.5)
   Loaded "zeek/zeek/spicy-tftp"
   ```

   If the package is installed a TFTP analyzer should be listed by `zeek -NN`, e.g.,

   ```console
   $ zeek -NN | grep -i tftp
    [Analyzer] spicy_TFTP (ANALYZER_SPICY_TFTP, enabled)
   ```

   Running the analyzer on some test data should produce a `tftp.log`. For this
   the scripts from the package need to be loaded, e.g., `@load packages`
   should be present in `local.zeek`.

   Using the file `tftp_rrq.pcap` from the [test data in the package
   repository](https://github.com/zeek/spicy-tftp/tree/main/testing/Traces):

   ```json
   $ zeek -Cr tftp_rrq.pcap
   $ ls *.log
   conn.log  packet_filter.log  tftp.log
   $ cat tftp.log | jq
   {
     "ts": 1737142107.374696,
     "uid": "CAMTBX2d54B930rgkg",
     "id.orig_h": "127.0.0.1",
     "id.orig_p": 60027,
     "id.resp_h": "127.0.0.1",
     "id.resp_p": 69,
     "wrq": false,
     "fname": "hello.txt",
     "mode": "octet",
     "uid_data": "Csmqzc1PPz5ZPJ1uj",
     "size": 0,
     "block_sent": 0,
     "block_acked": 0
   }
   ```

   </details>

1. Run `zeek` on `tftp-unsupported.pcap`. This should produce at least the log
   files `conn.log`, `tftp.log` and `analyzer.log`.

   <details>
   <summary>Hint</summary>

   If you only see `packet_filter.log` and `weird.log` you need to invoke `zeek` with an additional argument.
   </details>

   <details>
   <summary>Hint</summary>

   `weird.log` reports that the PCAP has bad checksums.

   ```json
   cat weird.log | jq
   {
     "ts": 1737142107.374696,
     "id.orig_h": "127.0.0.1",
     "id.orig_p": 0,
     "id.resp_h": "127.0.0.1",
     "id.resp_p": 0,
     "name": "bad_IP_checksum",
     "notice": false,
     "peer": "zeek",
     "source": "IP"
   }
   ```

   Run `zeek` with `-C` (or `--no-checksums`) causes Zeek to ignore checksums and produce the three log files.
   </details>

1. Working top to bottom, what is going on and what is the issue?

    a. What do you see in `conn.log`?

      <details>
      <summary>Solution</summary>

      - two connections are reported, `spicy_tftp_data` with data payload, and `spicy_tftp` for some request with TCP data not ack'd (leading to the checksum error)
      - the `resp_h` and `resp_p` of `spicy_tftp_data` connection match the
        `orig_h` and `orig_p` of the `spicy_tftp` connection, so they seem to
        belong to the same TFTP transaction
      - both connections report some data
      - apart from the missing ACK nothing seems obviously off

      ```json
      $ cat conn.log | jq
      {
        "ts": 1737142107.374971,
        "uid": "Csmqzc1PPz5ZPJ1uj",
        "id.orig_h": "127.0.0.1",
        "id.orig_p": 50012,
        "id.resp_h": "127.0.0.1",
        "id.resp_p": 60027,
        "proto": "udp",
        "service": "spicy_tftp_data",
        "duration": 0.0007979869842529297,
        "orig_bytes": 468,
        "resp_bytes": 12,
        "conn_state": "SF",
        "local_orig": true,
        "local_resp": true,
        "missed_bytes": 0,
        "history": "Dd",
        "orig_pkts": 3,
        "orig_ip_bytes": 552,
        "resp_pkts": 3,
        "resp_ip_bytes": 96,
        "ip_proto": 17
      }
      {
        "ts": 1737142107.374696,
        "uid": "CAMTBX2d54B930rgkg",
        "id.orig_h": "127.0.0.1",
        "id.orig_p": 60027,
        "id.resp_h": "127.0.0.1",
        "id.resp_p": 69,
        "proto": "udp",
        "service": "spicy_tftp",
        "conn_state": "S0",
        "local_orig": true,
        "local_resp": true,
        "missed_bytes": 0,
        "history": "D",
        "orig_pkts": 1,
        "orig_ip_bytes": 58,
        "resp_pkts": 0,
        "resp_ip_bytes": 0,
        "ip_proto": 17
      }
      ```

      </details>

      b. What do you see in `tftp.log`?

      <details>
      <summary>Solution</summary>

      - a single TFTP transaction for reading the file `hello.txt` is reported
      - both `block_sent` and `block_acked` are reported as zero, but no error seems to have occurred

      ```json
      $ cat tftp.log | jq
      {
        "ts": 1737142107.374696,
        "uid": "CAMTBX2d54B930rgkg",
        "id.orig_h": "127.0.0.1",
        "id.orig_p": 60027,
        "id.resp_h": "127.0.0.1",
        "id.resp_p": 69,
        "wrq": false,
        "fname": "hello.txt",
        "mode": "octet",
        "uid_data": "Csmqzc1PPz5ZPJ1uj",
        "size": 0,
        "block_sent": 0,
        "block_acked": 0
      }
      ```

      </details>

    b. What do you see in `analyzer.log`? How it related to the grammar?

    <details>
    <summary>Solution</summary>

    - the TFTP analyzer `SPICY_TFTP` reports a protocol violation since it sees an unknown and unhandled opcode (`Opcode::<unknown-6>`)
    - the payload data triggering this error is `b"\x00\x06blksize\x00256\x00"`

    ```json
    $ cat analyzer.log | jq
    {
      "ts": 1737142107.374971,
      "cause": "violation",
      "analyzer_kind": "protocol",
      "analyzer_name": "SPICY_TFTP",
      "uid": "Csmqzc1PPz5ZPJ1uj",
      "id.orig_h": "127.0.0.1",
      "id.orig_p": 50012,
      "id.resp_h": "127.0.0.1",
      "id.resp_p": 60027,
      "failure_reason": "no matching case in switch statement for value 'Opcode::<unknown-6>' (/root/spicy-tftp/analyzer/tftp.spicy:20:5-26:10)",
      "failure_data": "\\x00\\x06blksize\\x00256\\x00"
    }
    ```

    Looking at the error location
    `/root/spicy-tftp/analyzer/tftp.spicy:20:5-26:10`, the protocol violation
    happens since no `Opcode=6` is modelled in the grammar.

    ```spicy
    public type Packet = unit {    # public top-level entry point for parsing
        op: uint16 &convert=Opcode($$);
        switch ( self.op ) {
    #   ~~~~~~~~~~~~~~~~~~~~ no matching case in switch statement for value 'Opcode::<unknown-6>'
            Opcode::RRQ   -> rrq:   Request(True);
            Opcode::WRQ   -> wrq:   Request(False);
            Opcode::DATA  -> data:  Data;
            Opcode::ACK   -> ack:   Acknowledgement;
            Opcode::ERROR -> error: Error;
        };
    };
    ```

    ```spicy
    # TFTP supports five types of packets [...]:
    #
    # opcode  operation
    #   1     Read request (RRQ)
    #   2     Write request (WRQ)
    #   3     Data (DATA)
    #   4     Acknowledgment (ACK)
    #   5     Error (ERROR)
    type Opcode = enum {
      RRQ = 0x01,
      WRQ = 0x02,
      DATA = 0x03,
      ACK = 0x04,
      ERROR = 0x05
    };
    ```

    </details>

1. Figure out the spec of what you need to implement to parse this connection.

   <details>
   <summary>Hint</summary>

   Possible search terms: `TFTP opcode 6 RFC blksize` ([🔎 duckduckgo.com](https://duckduckgo.com/?q=TFTP%20opcode%206%20RFC%20blksize&t=ffab))
   </details>

   <details>
   <summary>Solution</summary>

   Relevant RFCs:

   - [RFC2348: TFTP Blocksize Option](https://www.rfc-editor.org/rfc/rfc2348)
   - [RFC2347: TFTP Option Extension](https://www.rfc-editor.org/rfc/rfc2347)

    RFC2348 is specifically about the `blksize` negotiation we are seeing here,
    but implementing option support more generally according to RFC2347 does
    not seem much more work.
   </details>

1. Write a minimal extension to the grammar so it can parse this connection
   (ignore logging for now).

   You only need to extend parsing for the response, why is the extra data in
   the request ignored? Add parsing to the request side as well and make sure
   we do not miss additional data in the future.

   Sometimes surrounding context is needed in addition to the payload
   information from the logs, but probably not here. If you still want to have
   a look at the PCAP with Wireshark you could install and run `tshark` like
   this:

   ```console
   $ apt-get update
   $ apt-get install -y tshark
   $ tshark -r /workspaces/zeek-playground/tftp-unsupported.pcap
   Running as user "root" and group "root". This could be dangerous.
       1   0.000000    127.0.0.1 → 127.0.0.1    TFTP 62 Read Request, File: hello.txt, Transfer type: octet, blksize=256
       2   0.000275    127.0.0.1 → 127.0.0.1    TFTP 46 Option Acknowledgement, blksize=256
       3   0.000520    127.0.0.1 → 127.0.0.1    TFTP 36 Acknowledgement, Block: 0
       4   0.000590    127.0.0.1 → 127.0.0.1    TFTP 292 Data Packet, Block: 1
       5   0.000816    127.0.0.1 → 127.0.0.1    TFTP 36 Acknowledgement, Block: 1
       6   0.000876    127.0.0.1 → 127.0.0.1    TFTP 226 Data Packet, Block: 2 (last)
       7   0.001073    127.0.0.1 → 127.0.0.1    TFTP 36 Acknowledgement, Block: 2
   ```

   <details>
   <summary>Solution</summary>

   1. To parse this trace without errors we only need to add support for Option Acknowledgment (OACK) packets.

       - Add support for OACK `Opcode`:

         ```patch
          type Opcode = enum {
              RRQ = 0x01,
              WRQ = 0x02,
              DATA = 0x03,
              ACK = 0x04,
         -    ERROR = 0x05
         +    ERROR = 0x05,
         +    OACK = 0x06,
         };
         ```

       - Add support for parsing OACK packets ignoring data for now since it will not be logged:

         ```patch
          public type Packet = unit {    # public top-level entry point for parsing
             op: uint16 &convert=Opcode($$);
             switch ( self.op ) {
                 Opcode::RRQ   -> rrq:   Request(True);
                 Opcode::WRQ   -> wrq:   Request(False);
                 Opcode::DATA  -> data:  Data;
                 Opcode::ACK   -> ack:   Acknowledgement;
                 Opcode::ERROR -> error: Error;
         +       Opcode::OACK -> : skip bytes &eod; # Ignore OACK payload for now.
                 };
         };

   1. Making sure all request data is consumed.

      The request was parsed successfully even with the additional option data
      since the parser operates on UDP data. For UDP data "connections" are only
      assembled by Zeek, but on the Spicy side each packet is parsed
      individually, so there is no stray data "left on the wire" for any other
      parser to stumble over.

      With that any extra data passed to `Request` simply falls off the end. We
      could encode that no additional data is expected by adding a `skip` field
      which consumes `bytes` until `&eod`, but can at most consume zero bytes
      (i.e., nothing expected until EOD).

      ```patch
       type Request = unit(is_read: bool) {
           filename: bytes &until=b"\x00";
           mode:     bytes &until=b"\x00";
      +    :         skip bytes &eod &max-size=0;

           on %done { spicy::accept_input(); }
       };
      ```

   1. Consume options on the request side.

      By consuming an unknown number of options we activate lookahead parsing
      which would fail for non-option data, so above explicit skipping is not
      needed anymore.

      - Add a unit to parse options:

          ```patch
          +type Option = unit {
          +    name: skip bytes &until=b"\x00";
          +    value: skip bytes &until=b"\x00";
          +};
          ```

      - Extend request to also consume options (data ignored for now):

          ```patch
           type Request = unit(is_read: bool) {
               filename: bytes &until=b"\x00";
               mode:     bytes &until=b"\x00";
          +    options:  skip Option[];

               on %done { spicy::accept_input(); }
           };
          ```

   </details>

1. If you have not already done so, add testing for your parser changes. What
   are the possible approaches and where should we test?

   <details>
   <summary>Solution</summary>

   Applying the terminology described in the [section about testing](./testing.md):

   - parsing changes affect individual units
   - the changed units are `public`
   - changes only affect the Spicy parsing layer with no visible external
     effects beyond absence of parse errors

   Ideally add some test based on a Spicy batch file, but for TFTP we make the
   connection between request and response only in the Zeek scripts. Instead
   add an system, end-to-end test based on the original PCAP (which is small):

   ```sh
   # @TEST-EXEC: zeek -NN Zeek::Spicy > l
   #
   # @TEST-EXEC: zeek -Cr ${TRACES}/tftp_blksize_option.pcap ${PACKAGE}
   #
   # Note: Try to extract relevant columns from common logs to
   #       reduce churn with upstream changes.
   # @TEST-EXEC: cat conn.log | zeek-cut uid service orig_pkts resp_pkts > conn.log.min
   # @TEST-EXEC: btest-diff conn.log.min
   #
   # @TEST-EXEC: btest-diff tftp.log
   ```

   Add some unit-style tests:

   ```sh
   ## Precompile grammar so we can reuse it across multiple tests.
   # @TEST-EXEC: spicyc -dj ${DIST}/analyzer/tftp.spicy %INPUT -o tftp.hlto

   ## Note: We use bash's `printf` to output binary data (BTest defaults to `sh`)
   ## below. We should capture this in a script for reuse.

   ## Validate parsing of OACK responses
   ## ----------------------------------
   ##
   ## Baseline:
   ##
   ##     TFTP::Packet {
   ##       op: OACK
   ##     }
   ##
   # @TEST-EXEC: bash -c 'printf "\x00\x06blksize\x00256\x00"' | spicy-dump tftp.hlto >oack.log 2>&1
   # @TEST-EXEC: btest-diff oack.log

   ## Validate parsing of options in requests
   ## ---------------------------------------

   ## No options
   ## ~~~~~~~~~~
   ##
   ## Baseline:
   ##
   ##     TFTP::Packet {
   ##       op: RRQ
   ##       rrq: TFTP::Request {
   ##         filename: hello.txt
   ##         mode: octet
   ##         options: []
   ##       }
   ##     }
   ##
   # @TEST-EXEC: bash -c 'printf "\x00\x01hello.txt\x00octet\x00"' | spicy-dump tftp.hlto >request-no-opts.log 2>&1
   # @TEST-EXEC: btest-diff request-no-opts.log

   ## Single option
   ## ~~~~~~~~~~~~~
   ##
   ## Baseline:
   ##
   ##     TFTP::Packet {
   ##       op: RRQ
   ##       rrq: TFTP::Request {
   ##         filename: hello.txt
   ##         mode: octet
   ##         options: [
   ##           TFTP::Option {}
   ##         ]
   ##       }
   ##     }
   ##
   # @TEST-EXEC: bash -c 'printf "\x00\x01hello.txt\x00octet\x00blksize\x00256\x00"' | spicy-dump tftp.hlto >request-single-opt.log 2>&1
   # @TEST-EXEC: btest-diff request-single-opt.log

   ## Multiple options
   ## ~~~~~~~~~~~~~~~~
   ##
   ## Deliberately test an unsupported option with slightly weird value (empty).
   ##
   ## Baseline:
   ##
   ##     TFTP::Packet {
   ##       op: RRQ
   ##       rrq: TFTP::Request {
   ##         filename: hello.txt
   ##         mode: octet
   ##         options: [
   ##           TFTP::Option {}
   ##           TFTP::Option {}
   ##         ]
   ##       }
   ##     }
   ##
   # @TEST-EXEC: bash -c 'printf "\x00\x01hello.txt\x00octet\x00blksize\x00256\x00my special option\x00\x00"' | spicy-dump tftp.hlto >request-two-opts.log 2>&1
   # @TEST-EXEC: btest-diff request-two-opts.log
   ```

   </details>

 <details>
 <summary>Spoiler</summary>

 During this exercise you basically implemented a solution for [zeek/spicy-tftp#14](https://github.com/zeek/spicy-tftp/issues/14).
 </details>

## Key takeaways

- `analyzer.log` is needed to operate parsers and should be ingested into the SIEM solution
  - similarly, `dpd.log` contains useful information about the DPD phase and is
    needed to diagnose issues where parsers never make it past DPD
- even if a parser fully supports a protocols RFC, extensions are common
  (codified in another RFC, or private)
- Always try to add tests when changing an analyzer. This not only makes sure
  that you do not accidentally break your parser, but also serves as living
  documentation of its features.
