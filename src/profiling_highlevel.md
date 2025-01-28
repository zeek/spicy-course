# High-level profiling with instrumentation

Spicy allows to instrument generated with profiling information with small
performance impact.

```admonish warning
While overhead from the profiling instrumentation in small, it is not zero.
```

Emitting profiling information is activated by invoking the tool performing the
compilation (e.g., `spicyc` or `spicyz`) with `-Z`.

```admonish hint
If the code is part of a Zeek package with CMake setup one can pass additional
`spicyz` flags via the CMake variable `SPICYZ_FLAGS`, e.g.,

~~~console
$ cmake -DSPICYZ_FLAGS='-Z' ..
~~~

If needed this can also be patched into the `build_command` in `zkg.meta`.
```

Information is collected on a per-function basis and includes:

- total number of invocations
- elapsed time
- fraction of elapsed time spent in this function
  - per top-level parser invocation
  - in total
- volume of input data consumed function (for parsers)

If parsing with Spicy-only tools (e.g., `spicy-driver`)
profiling information is emitted to stderr on exit.

When running with `zeek` one needs to set `Spicy::enable_profiling=T` to emit
profiling output on exit.

## Tangent: Implementation of parser runtime behavior

Spicy parsers consist of one or more `unit`s with fields which are parsers as
well. Overall code concentrates on describing some "shape" of the data, but
additional procedural code can be attached during a parser's lifetime.

The Spicy compiler lowers this code to an intermediary language (HILTI) which
in turn gets emitted as C++ code:

- Units are modelled as C++ classes (matching name), with top-level parsing
  entry points `parse1`/`parse2`/`parse3` (member functions of the class for
  the unit).
- additional internal helper methods `__parse...`  are invoked during parsing
- hooks are invoked from matching `__on_0x25_...` dispatcher functions
- all this code interacts with types and functions in Spicy's and HILTI's runtime libraries

## Example: `spicy-http`

We are [spicy-http](https://github.com/zeek/spicy-http) as example parser.

```console
git clone https://github.com/zeek/spicy-http
cd spicy-http/
```

Invoke the top-level parser `Requests` which parses a list `Request[]`. We see
that the bulk of the work happens in the parsing of `Request` itself.

```console
$ printf 'GET / HTTP/1.1\r\n\r\n' | \
    spicy-driver -Z analyzer/analyzer.spicy -p HTTP::Requests
#
# Profiling results
#
#name                                                   count       time      avg-%    total-%          volume
hilti/func/HTTP::Message::__on_0x25_init                    1        167       0.07       0.07               -
hilti/func/HTTP::Message::__on_end_of_hdr                   1        166       0.07       0.07               -
hilti/func/HTTP::Message::__parse_HTTP__Message_5_stage2          1       3292       1.34       1.34               -
hilti/func/HTTP::Message::__parse_headers_5_stage1          1       1542       0.63       0.63               -
hilti/func/HTTP::Message::__parse_stage1                    1      13541       5.52       5.52               -
hilti/func/HTTP::Request::__parse_HTTP__Request_2_stage2          1      58125      23.71      23.71               -
hilti/func/HTTP::Request::__parse_stage1                    1      67959      27.72      27.72               -
hilti/func/HTTP::RequestLine::__parse_HTTP__RequestLine_3_stage2          1      33542      13.68      13.68               -
hilti/func/HTTP::RequestLine::__parse_stage1                1      34125      13.92      13.92               -
hilti/func/HTTP::Requests::__parse_HTTP__Requests_stage2          1      83166      33.92      33.92               -
hilti/func/HTTP::Requests::__parse__anon_2_stage1           1      82625      33.70      33.70               -
hilti/func/HTTP::Requests::__parse_stage1                   1      93000      37.93      37.93               -
hilti/func/HTTP::Requests::parse3                           1     102917      41.98      41.98               -
hilti/func/HTTP::Version::__parse_HTTP__Version_5_stage2          1      16708       6.81       6.81               -
hilti/func/HTTP::Version::__parse_stage1                    1      17250       7.04       7.04               -
hilti/func/HTTP::__register_HTTP_Body                       1      38958      15.89      15.89               -
hilti/func/HTTP::__register_HTTP_Chunk                      1        250       0.10       0.10               -
hilti/func/HTTP::__register_HTTP_Chunks                     1        125       0.05       0.05               -
hilti/func/HTTP::__register_HTTP_Content                    1        458       0.19       0.19               -
hilti/func/HTTP::__register_HTTP_Header                     1        166       0.07       0.07               -
hilti/func/HTTP::__register_HTTP_Message                    1         42       0.02       0.02               -
hilti/func/HTTP::__register_HTTP_Replies                    1      10875       4.44       4.44               -
hilti/func/HTTP::__register_HTTP_Reply                      1        250       0.10       0.10               -
hilti/func/HTTP::__register_HTTP_ReplyLine                  1         83       0.03       0.03               -
hilti/func/HTTP::__register_HTTP_Request                    1         83       0.03       0.03               -
hilti/func/HTTP::__register_HTTP_RequestLine                1        209       0.09       0.09               -
hilti/func/HTTP::__register_HTTP_Requests                   1        458       0.19       0.19               -
hilti/func/HTTP::__register_HTTP_Version                    1         83       0.03       0.03               -
hilti/func/filter::__register_filter_Base64Decode           1        416       0.17       0.17               -
hilti/func/filter::__register_filter_Zlib                   1        291       0.12       0.12               -
hilti/total                                                 1     245167     100.00     100.00               -
spicy/prepare/input/HTTP::Requests                          1       1875       0.76       0.76               -
spicy/unit/HTTP::Message                                    1      13292       5.42       5.42               2
spicy/unit/HTTP::Message::body                              1        125       0.05       0.05               0
spicy/unit/HTTP::Message::end_of_hdr                        1        500       0.20       0.20               2
spicy/unit/HTTP::Message::headers                           1       2291       0.93       0.93               0
spicy/unit/HTTP::Request                                    1      67709      27.62      27.62              18
spicy/unit/HTTP::Request::message                           1      23292       9.50       9.50               2
spicy/unit/HTTP::Request::request                           1      34541      14.09      14.09              16
spicy/unit/HTTP::RequestLine                                1      33875      13.82      13.82              16
spicy/unit/HTTP::RequestLine::_anon_6                       1       2208       0.90       0.90               1
spicy/unit/HTTP::RequestLine::_anon_7                       1        500       0.20       0.20               1
spicy/unit/HTTP::RequestLine::_anon_8                       1       1375       0.56       0.56               2
spicy/unit/HTTP::RequestLine::method                        1       9875       4.03       4.03               3
spicy/unit/HTTP::RequestLine::uri                           1       1209       0.49       0.49               1
spicy/unit/HTTP::RequestLine::version                       1      17583       7.17       7.17               8
spicy/unit/HTTP::Requests                                   1      92792      37.85      37.85              18
spicy/unit/HTTP::Requests::_anon_2                          1      82917      33.82      33.82              18
spicy/unit/HTTP::Requests::_anon_2::_anon                   1      68583      27.97      27.97              18
spicy/unit/HTTP::Version                                    1      17000       6.93       6.93               8
spicy/unit/HTTP::Version::_anon_5                           1      13708       5.59       5.59               5
spicy/unit/HTTP::Version::number                            1       2583       1.05       1.05               3
```

When running as part of Zeek additional code is executing, we e.g., see the
work from forwarding message bodies into Zeek file analysis framework via
`file_data_in`:

```console
$ cmake -B build -DSPICYZ_FLAGS='-Z'
$ make -C build/
$ zeek -Cr tests/traces/http-non-default-port.pcap \
    build/http.hlto analyzer \
    'Spicy::enable_profiling=T'
#
# Profiling results
#
#name                                                   count       time      avg-%    total-%          volume
hilti/func/HTTP::Body::__on_0x25_done                       1        250       0.00       0.00               -
hilti/func/HTTP::Body::__on_0x25_init                       1      27750       0.10       0.10               -
hilti/func/HTTP::Body::__parse_HTTP__Body_6_stage2          1    1439417       5.12       5.12               -
...
spicy/unit/HTTP::Version::_anon_5                           2       4832       0.01       0.02              10
spicy/unit/HTTP::Version::number                            2       3583       0.01       0.01               6
zeek/event/http_all_headers                                 2        250       0.00       0.00               -
zeek/event/http_begin_entity                                2       1750       0.00       0.01               -
zeek/event/http_content_type                                2        292       0.00       0.00               -
zeek/event/http_end_entity                                  2       1542       0.00       0.01               -
zeek/event/http_entity_data                                 1       2500       0.01       0.01               -
zeek/event/http_header                                      9      10960       0.00       0.04               -
zeek/event/http_message_done                                2       2917       0.01       0.01               -
zeek/event/http_reply                                       1       2042       0.01       0.01               -
zeek/event/http_request                                     1       4500       0.02       0.02               -
zeek/rt/confirm_protocol                                    1       3875       0.01       0.01               -
zeek/rt/current_conn                                       17       2540       0.00       0.01               -
zeek/rt/current_is_orig                                    15        790       0.00       0.00               -
zeek/rt/event_arg_type                                     36       4832       0.00       0.02               -
zeek/rt/file-stack-push                                     1      32625       0.12       0.12               -
zeek/rt/file-stack-remove                                   1        167       0.00       0.00               -
zeek/rt/file_begin                                          1      76125       0.27       0.27               -
zeek/rt/file_data_in                                        1    1060042       3.77       3.77               -
zeek/rt/file_end                                            1        708       0.00       0.00               -
zeek/rt/file_set_size                                       1       2167       0.01       0.01               -
zeek/rt/file_state                                          4        708       0.00       0.00               -
zeek/rt/file_state_stack                                    6        374       0.00       0.00               -
zeek/rt/internal_handler                                   49      10334       0.00       0.04               -
zeek/rt/raise_event                                        17       2832       0.00       0.01               -
```
