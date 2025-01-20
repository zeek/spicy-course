hljs.registerLanguage('evt', () => ({
  name: "evt",
  keywords: {
    keyword: 'protocol packet file analyzer over TCP UDP'
      + ' originator responder'
      + ' with'
      + ' on if event'
      + ' parse with port'
  },
  contains: [
    hljs.HASH_COMMENT_MODE,
    {
      className: 'literal',
      begin: /\d+\/(tcp|udp|icmp)/,
    },
    hljs.C_NUMBER_MODE,
  ]
}));

hljs.initHighlightingOnLoad()
