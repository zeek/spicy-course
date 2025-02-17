# Zeek: Log very active users

> To analyze which users are most active we want to log users which have send
> more than 5 messages with inter-message-arrival time of less than 5s.

One reason for doing this in Zeek instead of offline would be since it
allows performing the analysis without having to store information about all
messages.

## Notes

This exercise includes a likely small adjustment to the analyzer with most of the
needed analysis happening in custom Zeek code.

<details>
<summary>Sketch of possible solution</summary>

The only change needed for the analyzer is that we now also need to surface
`PRIVMSG` IRC messages. For the analyzer sketched above this could be
accomplished by creating a new Zeek event which is raised for messages with
command `PRIVMSG` and with a `prefix` (containing the username).

To collect the needed statistics we could use a Zeek table holding the number
of messages seen per user. By using Zeek's `&write_expire` we offload removing
less active users, and trigger notices from the event handler if a user's
activity exceeds the threshold.

```zeek
global user_msg_stats: table[string] of count &default=0 &write_expire=5secs;

event irc::privmsg(prefix: string)
    {
    # Count this message.
    user_msg_stats[prefix] += 1;

    # Report if exceeding threshold.
    if ( user_msg_stats[prefix] >= 5 )
        {
        # TODO: Turn this into a notice.
        print fmt("user %s is noisy", prefix);
        }
    }
```

</details>
