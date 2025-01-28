# Testing parsers with shared state

If parser share state, e.g., via a `%context` we might not be able to fully test them in isolation.

For this Spicy allows parsing [batch
input](https://docs.zeek.org/projects/spicy/en/latest/toolchain.html#batch-input)
which are trace files similar to PCAPs.

As an example consider this PCAP:

```console
$ tshark -r http-get.pcap
    1   0.000000          ::1 → ::1          TCP 56150 → 8080 [SYN] Seq=0 Win=65535 Len=0 MSS=16324 WS=64 TSval=2906150528 TSecr=0 SACK_PERM
    2   0.000147          ::1 → ::1          TCP 8080 → 56150 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=16324 WS=64 TSval=91891620 TSecr=2906150528 SACK_PERM
    3   0.000173          ::1 → ::1          TCP 56150 → 8080 [ACK] Seq=1 Ack=1 Win=407744 Len=0 TSval=2906150528 TSecr=91891620
    4   0.000185          ::1 → ::1          TCP [TCP Window Update] 8080 → 56150 [ACK] Seq=1 Ack=1 Win=407744 Len=0 TSval=91891620 TSecr=2906150528
    5   0.000211          ::1 → ::1          HTTP GET /hello.txt HTTP/1.1
    6   0.000233          ::1 → ::1          TCP 8080 → 56150 [ACK] Seq=1 Ack=87 Win=407680 Len=0 TSval=91891620 TSecr=2906150528
    7   0.000520          ::1 → ::1          TCP HTTP/1.1 200 OK
    8   0.000540          ::1 → ::1          TCP 56150 → 8080 [ACK] Seq=87 Ack=275 Win=407488 Len=0 TSval=2906150528 TSecr=91891620
    9   0.000584          ::1 → ::1          HTTP HTTP/1.1 200 OK  (text/plain)
   10   0.000602          ::1 → ::1          TCP 56150 → 8080 [ACK] Seq=87 Ack=293 Win=407488 Len=0 TSval=2906150528 TSecr=91891620
   11   0.000664          ::1 → ::1          TCP 56150 → 8080 [FIN, ACK] Seq=87 Ack=293 Win=407488 Len=0 TSval=2906150528 TSecr=91891620
   12   0.000686          ::1 → ::1          TCP 8080 → 56150 [ACK] Seq=293 Ack=88 Win=407680 Len=0 TSval=91891620 TSecr=2906150528
   13   0.000704          ::1 → ::1          TCP 8080 → 56150 [FIN, ACK] Seq=293 Ack=88 Win=407680 Len=0 TSval=91891620 TSecr=2906150528
   14   0.000758          ::1 → ::1          TCP 56150 → 8080 [ACK] Seq=88 Ack=294 Win=407488 Len=0 TSval=2906150528 TSecr=91891620
```

We can convert this to a Spicy batch file `batch.dat` by loading a Zeek policy
script (redef `Spicy::filename` to change the output path):

```console
$ zeek -Cr http-get.pcap -b policy/frameworks/spicy/record-spicy-batch
tracking [orig_h=::1, orig_p=56150/tcp, resp_h=::1, resp_p=8080/tcp, proto=6]
recorded 1 session total
output in batch.dat
```

Now `batch.dat` contains data for processing with e.g., `spicy-driver` and could be edited.

```admonish warning
Most data portions in this batch file have lines terminated with
<kbd>CR</kbd><kbd>LF</kbd>, but only <kbd>LF</kbd> is rendered here.
```

```spicy-batch
!spicy-batch v2
@begin-conn ::1-56150-::1-8080-tcp stream ::1-56150-::1-8080-tcp-orig 8080/tcp%orig ::1-56150-::1-8080-tcp-resp 8080/tcp%resp
@data ::1-56150-::1-8080-tcp-orig 86
GET /hello.txt HTTP/1.1
Host: localhost:8080
User-Agent: curl/8.7.1
Accept: */*


@data ::1-56150-::1-8080-tcp-resp 274
HTTP/1.1 200 OK
content-length: 18
content-disposition: inline; filename="hello.txt"
last-modified: Thu, 23 Jan 2025 09:46:26 GMT
accept-ranges: bytes
content-type: text/plain; charset=utf-8
etag: "af67690:12:67920ff2:34f489e1"
date: Thu, 23 Jan 2025 09:46:41 GMT


@data ::1-56150-::1-8080-tcp-resp 18
Well hello there!

@end-conn ::1-56150-::1-8080-tcp
```

The originator and responder of this connection are on port `56150/tcp` and
`8080/tcp`. Any analyzer with a either `%port` would be invoked for this
traffic automatically, e.g.,

```spicy
module foo;

public type X = unit {
    %port = 8080/tcp;
    data: bytes &eod;
};

on foo::X::%done {
    print self;
}
```

```console
$ spicy-driver -F batch.dat parse.spicy -d
[$data=b"GET /hello.txt HTTP/1.1\x0d\x0aHost: localhost:8080\x0d\x0aUser-Agent: curl/8.7.1\x0d\x0aAccept: */*\x0d\x0a\x0d\x0a"]
[$data=b"HTTP/1.1 200 OK\x0d\x0acontent-length: 18\x0d\x0acontent-disposition: inline; filename=\"hello.txt\"\x0d\x0alast-modified: Thu, 23 Jan 2025 09:46:26 GMT\x0d\x0aaccept-ranges: bytes\x0d\x0acontent-type: text/plain; charset=utf-8\x0d\x0aetag: \"af67690:12:67920ff2:34f489e1\"\x0d\x0adate: Thu, 23 Jan 2025 09:46:41 GMT\x0d\x0a\x0d\x0aWell hello there!\x0a"]
```

The same mechanism works for mime types.

With `>=spicy-1.13` (part of `>=zeek-7.2`) one can also externally specify how
analyzers should be mapped to ports so the grammars do not need to specify
`%port`/`%mime-type`, e.g.,

```console
# Grammar has no `%port` attribute.
$ spicy-driver -F batch.dat parse.spicy -d --parser-alias '8080/tcp=foo::X'
```
