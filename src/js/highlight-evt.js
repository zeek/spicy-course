hljs.registerLanguage('evt', () => ({
  name: "evt",
  keywords: {
    keyword: 'protocol packet file analyzer over TCP UDP '
    + 'originator responder '
    + 'with '
    + 'on if event',
    built_in: 'parse with port',
  },
  contains: [
    hljs.HASH_COMMENT_MODE,
  ]
}));

hljs.initHighlightingOnLoad()
