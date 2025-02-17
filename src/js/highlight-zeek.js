hljs.registerLanguage('zeek', () => ({
  name: "zeek",
  keywords: {
    keyword: 'event hook '
      + 'local global '
      + 'return print',
    built_in: 'connection bool string count '
      + 'fmt ',
  },
  contains: [
    hljs.HASH_COMMENT_MODE,
    hljs.QUOTE_STRING_MODE,
    {
      className: 'meta',
      begin: /@/,
    }, {
      className: 'literal',
      begin: /\d+\/(tcp|udp|icmp)/,
    },
    {
      className: 'literal',
      begin: /&[\w_]+/,
    },
  ],
}));

hljs.initHighlightingOnLoad()
