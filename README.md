# trainSchedule

[Visit page here](https://gregvx.github.io/trainSchedule/)

This app allows users to enter train route schedules and view the minutes until the next arrival. Routes entered are stored in a firebase database.

There is a rare case where the minutes to the next train arrival occurs after the first train of the day. We need to check for this and show the number of minutes until the first train of the day.
Example: say we have a route that starts at 1:00am and goes comes again every 59 minutes...
There would be a train at 1:59, 2:58, 3:57, 4:56...23:37, 00:36.
If the current time is 12:40am, the last train would have been 4 minutes ago at 12:36am, but the next train will not be 59 minutes later at 1:35am. It will be at 1:00am because that is when the new day's train shcedule starts, so at 12:40am, the next train will not be in 55 minutes, it will be in 20 minutes.

By using an if statement, we check for that scenario and correct the variable that holds the time of the next arrival.