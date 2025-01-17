# Logging basic parser operation

Let's install the analyzer (assuming we are in local clone of
[`zeek/spicy-tftp`](https://github.com/zeek/spicy-tftp) at `v0.0.5`).

```console
$ zkg install .
The following packages will be INSTALLED:
  /root/spicy-tftp (main)

Proceed? [Y/n]
Running unit tests for "/root/spicy-tftp"
Installing "/root/spicy-tftp".....
Installed "/root/spicy-tftp" (main)
Loaded "/root/spicy-tftp"
```

If we replay a a PCAP with TFTP traffic we see no connections marked with
`service` `tftp` in `conn.log`, or a `tftp.log`:

```console
$ zeek -r testing/Traces/tftp_rrq.pcap
$ cat conn.log | zeek-cut -C ts id.orig_h id.orig_p id.resp_h id.resp_p service
#separator \x09
#set_separator  ,
#empty_field    (empty)
#unset_field    -
#path   conn
#open   2025-01-17-11-18-34
#fields ts      id.orig_h       id.orig_p       id.resp_h       id.resp_p       service
#types  time    addr    port    addr    port    string
1367411052.077243       192.168.0.10    3445    192.168.0.253   50618   -
1367411051.972852       192.168.0.253   50618   192.168.0.10    69      -
#close  2025-01-17-11-18-34
```

Both Zeek's Spicy plugin as well as Spicy parsers can emit additional debug
information at runtime. The value of the environment variable `HILTI_DEBUG`
controls this behavior which can take e.g., the following values:

- `HILTI_DEBUG=zeek`: information about Zeek's Spicy plugin

Available if parser was built in debug mode:

- `HILTI_DEBUG=spicy`: high-level information about Spicy parser behavior
- `HILTI_DEBUG=spicy-verbose`: low-level information about Spicy parser behavior

Multiple values can be separated by `:`, e.g, `HILTI_DEBUG=zeek:spicy`.

```admonish hint
Zeek comes with its own debug streams which are enabled if Zeek was compiled with `--enable-debug`:

~~~console
$ zeek -B help
Enable debug output into debug.log with -B <streams>.
<streams> is a case-insensitive, comma-separated list of streams to enable:

  broker
  cluster
  dpd
  file-analysis
  hashkey
  input
  logging
  main-loop
  notifiers
  packet-analysis
  pktio
  plugins
  rules
  scripts
  serial
  spicy
  string
  supervisor
  threading
  tm
  zeekygen

Every plugin (see -N) also has its own debug stream:

  plugin-<plugin-name>   (replace '::' in name with '-'; e.g., '-B plugin-Zeek-JavaScript')

Pseudo streams:

  verbose  Increase verbosity.
  all      Enable all streams at maximum verbosity.

~~~

To debug Spicy analyzers the most useful streams are `dpd`, `file-analysis`, and `spicy`.
```

With `HILTI_DEBUG=zeek` we can see why no logs are produced:

```console
$ HILTI_DEBUG=zeek zeek -r testing/Traces/tftp_rrq.pcap
[zeek] Registering TCP protocol analyzer Finger with Zeek
[zeek] Registering TCP protocol analyzer LDAP_TCP with Zeek
[zeek] Registering UDP protocol analyzer LDAP_UDP with Zeek
[zeek] Registering TCP protocol analyzer PostgreSQL with Zeek
[zeek] Registering UDP protocol analyzer QUIC with Zeek
[zeek] Registering UDP protocol analyzer Syslog with Zeek
[zeek] Registering TCP protocol analyzer spicy::WebSocket with Zeek
[zeek] Done with post-script initialization
[zeek] Shutting down Spicy runtime
```

The TFTP analyzer does not seem to register with Zeek even though it is installed 🤨.

Cause in this case: `local.zeek` does not load `zkg`-installed plugins.

```zeek
# Uncomment this to source zkg's package state
# @load packages
```

If we uncomment that line or manually load `packages` we produce output.

```console
$ HILTI_DEBUG=zeek zeek -r testing/Traces/tftp_rrq.pcap -C packages
[zeek] Registering TCP protocol analyzer Finger with Zeek
[zeek] Registering TCP protocol analyzer LDAP_TCP with Zeek
[zeek] Registering UDP protocol analyzer LDAP_UDP with Zeek
[zeek] Registering TCP protocol analyzer PostgreSQL with Zeek
[zeek] Registering UDP protocol analyzer QUIC with Zeek
[zeek] Registering UDP protocol analyzer Syslog with Zeek
[zeek] Registering TCP protocol analyzer spicy::WebSocket with Zeek
[zeek] Registering UDP protocol analyzer spicy::TFTP with Zeek       <---- HERE
[zeek]   Scheduling analyzer for port 69/udp
[zeek] Done with post-script initialization
[zeek] confirming protocol 110/0                                     <---- HERE
[zeek] Shutting down Spicy runtime
```

```console
$ cat tftp.log
#separator \x09
#set_separator  ,
#empty_field    (empty)
#unset_field    -
#path   tftp
#open   2025-01-17-12-18-09
#fields ts      uid     id.orig_h       id.orig_p       id.resp_h       id.resp_p       wrq     fname   mode    uid_data        size    block_sent      block_acked     error_code      error_msg
#types  time    string  addr    port    addr    port    bool    string  string  string  count   count   count   count   string
1367411051.972852       Clw8cG1TykDCJQXei2      192.168.0.253   50618   192.168.0.10    69      F       rfc1350.txt     octet   CNR2ur1rbdum6auCFi      24599   49      49      -       -
#close  2025-01-17-12-18-09
```

## Building Spicy parsers with debug support

Debug support for Spicy parsers needs to be compiled in.

One option: Change analyzer CMake configuration in `zkg.meta`'s `build_command`:

```patch
- build_command = ... cmake .. && cmake --build .
+ build_command = ... cmake .. -DCMAKE_BUILD_TYPE=Debug && cmake --build .
```

Commit changes and install patched analyzer:

```console
$ git add -u && git commit -m'Switch to debug mode'
[main e2826a1] Switch to debug mode
 1 file changed, 1 insertion(+), 1 deletion(-)
$ zkg install .
```

Instead of installing one could also just use such a debug install for local
debugging, e.g., from tests. In that case one invokes CMake directly and could
use the following invocation:

```console
# Inside build directory.
$ cmake -DCMAKE_BUILD_TYPE=Debug ..
```

## Exercise

1. What kind of output is emitted with `HILTI_DEBUG=spicy`? Can you relate it to the Spicy grammar in `analyzer/tftp.spicy`?

1. What additional output is emitted with `HILTI_DEBUG=spicy:spicy-verbose`?
