hljs.registerLanguage('zeek', () => ({
  name: "zeek",
  keywords: {
    keyword: 'event hook local',
    built_in: 'connection bool string',
  },
  contains: [
    hljs.HASH_COMMENT_MODE,
    hljs.QUOTE_STRING_MODE,
  ],
}));

hljs.initHighlightingOnLoad()
