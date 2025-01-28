# Profiling

Profiling is the process of measuring where computing resources (typically: CPU
time, memory) are spent in a program at runtime.

With profiling information we can validate that our program stays within its
resource budget, or quantitatively compare the runtime characteristics of
different implementations.

Effective use of profiling often involves a mix of profiling during development
as well as in production (likely: at different granularity). To prevent
regressions it needs to be continuous.

Spicy supports both instrumentation to emit high-level profiling information as
well as low-level profiling with typical tools. In the following we discuss
these approaches separately.
