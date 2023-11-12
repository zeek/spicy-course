// This is a grammar for highlight.js used by mdbook.
//
// - Guide on writing highlighters: https://highlightjs.readthedocs.io/en/latest/language-guide.html
// - possible values for `scope`/`className`: https://highlightjs.readthedocs.io/en/latest/css-classes-reference.html

hljs.registerLanguage("spicy", (hljs) => ({
  name: "Spicy",
  keywords: {
    keyword:
      // TODO(bbannier): $$
      'public self module import function '
      + 'global local const var return on break stop throw skip inout \\$\\$ '
      + 'while break continue '
      + 'for in '
      + 'if else '
      + 'switch case default '
      + 'type enum struct tuple unit ',
    literal: 'True False Null',
    built_in: 'uint8 uint16 uint32 uint64 '
      + 'int8 int16 int32 int64 '
      + 'bytes string '
      + 'optional '
      + 'vector set map '
      + 'bitfield void '
      + 'address network port time '
      + 'print assert '
      + 'begin end '
      + 'cast ',

  },
  contains: [
    hljs.QUOTE_STRING_MODE,
    hljs.C_NUMBER_MODE,
    hljs.HASH_COMMENT_MODE,
    hljs.REGEXP_MODE,
    {
      // Properties & hooks.
      className: 'meta',
      begin: /%\w+[-|\w]*/
    }, {
      // Attributes.
      className: 'meta',
      begin: /&\w+[-|\w]*/
    }, {
      className: 'operator',
      begin: hljs.RE_STARTERS_RE,
    }, 
  ]
}));

hljs.initHighlightingOnLoad()
