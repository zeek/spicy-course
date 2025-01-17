# Day-2 parser operation

Congratulations! You have finished development of a Spicy-based Zeek analyzer
which produces Zeek logs when exposed to its intended input; you even added a
test suite to ensure that it behaves as intended.

Your analyzer works in a controlled lab environment, but deploying and
continuously operating it in a production environment will introduce new
challenges, e.g.,

- Your parser will see traffic you had not anticipated.
- The traffic mix in production might force you to reevaluate tradeoffs you
  made during development.

Concerns like this are often summarized as _Day-2 problems_ in contrast to
design and planning (_Day-0_) and deploying a working prototype (_Day-1_).

This chapter will discuss some tools and approaches to address them. We will
look at this under the assumption that PCAPs have been captured. Another import
concern in production is monitoring which we will not discuss in here.
