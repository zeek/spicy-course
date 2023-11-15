# Exercises: A naive CSV parser

Assuming the following simplified CSV format:

- rows are separated by newlines `b"\n"`
- individual columns are separated by `b","`
- there are not separators anywhere else (e.g., no `,` in quoted column values)

A sample input would be

```csv
1,a,ABC
2,b,DEF
3,c,GHI
```

For testing you can use the `-f` flag to `spicy-dump` or `spicy-driver` to read
input from a file instead of stdin, e.g.,

```console
spicy-driver csv_naive.spicy -f input.csv
```

1. Write a parser which extracts the bytes on each row into a list.

   <details>
    <summary>Hint 1</summary>

    You top-level parser should contain a list of rows which has unspecified length.
   </details>

   <details>
    <summary>Hint 2</summary>

    Define a new parser for a row which parses `bytes` until it finds a newline
    and consumes it.
   </details>

   <details>
    <summary>Solution</summary>

    ```spicy
    module csv_naive;

    public type CSV = unit {
        rows: Row[];
    };

    type Row = unit {
        data: bytes &until=b"\n";
    };
    ```

   </details>

2. Extend your parser so it also extracts individual columns (as `bytes`) from
   each row.

   <details>
    <summary>Hint</summary>

    The [`&convert`
    attribute](https://docs.zeek.org/projects/spicy/en/latest/programming/parsing.html#on-the-fly-type-conversion-with-convert)
    allows changing the value and/or type of a field after it has been
    extracted. This allows you to split the row data into columns.

   Is there a builtin function which splits your row data at a separator
   (consuming the iterator)? Functions on `bytes` are documented
   [here](https://docs.zeek.org/projects/spicy/en/latest/programming/language/types.html#bytes).
   You can access the currently extracted data via `$$`.
   </details>

   <details>
   <summary>Solution</summary>

   ```spicy
   module csv_naive;

   public type CSV = unit {
       rows: Row[];
   };

   type Row = unit {
       cols: bytes &until=b"\n" &convert=$$.split(b",");
   };
   ```

   </details>

3. Without changing the actual parsing, can you change your grammar so the
   following output is produced? This can be done without explicit loops.

   ```console
   $ spicy-driver csv_naive.spicy -f input.csv
   [[b"1", b"a", b"ABC"], [b"2", b"b", b"DEF"], [b"3", b"c", b"GHI"]]
   ```

   <details>
    <summary>Hint 1</summary>

    You could add a unit hook for your top-level unit which prints the rows.

    ```spicy
    on CSV::%done {
        print self.rows;
    }
    ```

    Since `rows` is a list of units you still need to massage its data though ...
   </details>

   <details>
    <summary>Hint 2</summary>

    You can use a unit `&convert` attribute on your row type to transform it to
    its row data.
   </details>

   <details>
    <summary>Solution</summary>

   ```spicy
   module csv_naive;

   public type CSV = unit {
       rows: Row[];
   };

   type Row = unit {
       data: bytes &until=b"\n" &convert=$$.split(b",");
   } &convert=self.data;

   on CSV::%done {
       print self.rows;
   }
   ```

   </details>
