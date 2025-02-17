# Project: IRC

At this point you should have all the information needed to extract on-wire
information via custom parsers and surface it in Zeek for logging (the ultimate
goal of most parsing tasks).

The following has a number of tasks around IRC traffic with require combining
all needed pieces with less hand holding.

As a general guideline, try to get a working solution first (however ugly), and
then dive into cleaning up your implementation (e.g., better parsing, or more
targeted or useful events).

You can assume that we are tapping in front of an IRC server which communicates over TCP.
