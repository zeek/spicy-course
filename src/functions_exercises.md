# Exercises

1. Write a function computing values of the [Fibonacci
   sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence), i.e., a function

   ```spicy
   function fib(n: uint64): uint64 { ... }
   ```

   - if `n < 2` return `n`
   - else return `fib(n - 1) + fib(n - 2)`

   For testing you can `assert fib(8) == 21;`.

   <details>
   <summary>Solution</summary>

   ```spicy
   function fib(n: uint64): uint64 {
       if (n < 2)
           return n;

       # This runs iff above `if` condition was false, but in this case could also be written
       # as an `else` branch.
       return fib(n - 1) + fib(n - 2);
   }
   ```

   </details>

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

   <details>
   <summary>Solution</summary>

   ```spicy
   function fib(n: uint64, inout cache: map<uint64, uint64>): uint64 {
       # If the value is already in the cache we do not need to compute it.
       if (n in cache)
           return cache[n];

       # Value was not in the cache. Compute its value and store it.
       local r = 0;

       if (n < 2)
           r = n;

       else
           # Here we want an `else` branch for sure. We need to pass the cache
           # down to other invocations. Since the passing happens by reference all
           # invocations share a cache.
           r = fib(n - 1, cache) + fib(n - 2, cache);

       # Persist r in cache.
       cache[n] = r;

       # Return the r.
       return r;
   }
   ```

   </details>

1. Try modifying your `fib` functions so users do not have to provide the cache
   themselves.

   <details>
   <summary>Hint</summary>

   You want to store the cache somewhere yourself and provide users with a
   wrapped function which implicitly uses your cache.

   There are two places to put the cache:

   - Construct the cache as a local variable inside the body of your wrapper
     function. With this different invocations of the wrapper function would
     not share the same cache which can be useful in certain scenarios.
   - Alternatively one could store the cache in a `global`.

   </details>
