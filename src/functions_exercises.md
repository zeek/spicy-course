# Exercises

1. Write a function computing values of the [Fibonacci
   sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence), i.e., a function

   ```spicy
   function fib(n: uint64): uint64 { ... }
   ```

   - if `n < 2` return `n`
   - else return `fib(n - 1) + fib(n - 2)`

   For testing you can `assert fib(8) == 21;`.

1. Add memoization to your `fib` function. For that change its signature to

   ```spicy
   function fib(n: uint64, inout cache: map<uint64, uint64>): uint64 { ... }
   ```

   This can then be called like so:

   ```spicy
   global m_fib: map<uint64, uint64>;
   fib(64, m_fib);
   ```

   For testing you can `assert fib(64, m_fib) == 10610209857723;`.

1. Try modifying your `fib` functions so users do not have to provide the cache
   themselves.
