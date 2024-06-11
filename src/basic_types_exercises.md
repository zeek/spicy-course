# Exercises

1. What happens at compile time if you try to create a `uint8` a value outside
   of its range, e.g., `uint8(-1)` or `uint8(1024)`?
1. What happens at runtime if you perform an operation which leaves the domain
   of an integer value, e.g.,

   ```spicy
   global x = 0;
   print x - 1;

   global y: uint8 = 255;
   print y + 1;

   global z = 1024;
   print cast<uint8>(z);

   print 4711/0;
   ```

1. What happens at compile time if you access a non-existing tuple element, e.g.,

   ```spicy
   global xs = tuple(1, "a", b"c");
   print xs[4711];

   global xs: tuple<first: uint8, second: string> = (1, "a");
   print xs.third;
   ```

1. What happens at runtime if you try to get a non-existing `vector` element, e.g.,

   ```spicy
   print vector(1, 2, 3)[4711];
   ```

1. What happens at runtime if you try to dereference an invalidated iterator, e.g.,

   ```spicy
   global xs = vector(1);
   global it = begin(xs);
   print *it;
   xs.pop_back();
   print *it;
   ```

1. Can you dereference a collection's `end` iterator?

1. What happens at runtime if you dereference an unset `optional`?
