hljs.registerLanguage('spicy-batch', () => ({
  name: "spicy-batch",
  contains: [
    {
      className: 'section',
      begin: '^@',
      end: '$'
    },
    {
      className: 'meta',
      begin: '^!',
      end: '$'
    },
  ]
}));

hljs.initHighlightingOnLoad()
