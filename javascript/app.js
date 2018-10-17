// Initialize Firebase
var config = {
    apiKey: "AIzaSyCcSBS6ysfWBG2K77eaqkzrrB60nlS4b9s",
    authDomain: "trainscheduler-dd560.firebaseapp.com",
    databaseURL: "https://trainscheduler-dd560.firebaseio.com/",
    storageBucket: "trainscheduler-dd560.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();


// Button for adding Routes
$("#add-train-btn").on("click", function (event) {
    event.preventDefault();

    // Grab user input
    var trainName = $("#train-name-input").val().trim();
    var trainDest = $("#destination-input").val().trim();
    var trainFirst = moment($("#first-time-input").val().trim(), "HH:mm").format("X");
    var trainFreq = $("#frequency-input").val().trim();

    // Creates local "temporary" object for holding route data
    var newTrain = {
        name: trainName,
        destination: trainDest,
        firstTime: trainFirst,
        frequency: trainFreq
    };

    // Uploads route data to the database
    database.ref().push(newTrain);

    // Logs everything to console
    console.log("At this point, the data should have been sent to the database. Here is the data that got sent:");
    console.log(newTrain.name);
    console.log(newTrain.destination);
    console.log(newTrain.firstTime);
    console.log(newTrain.frequency);
    

    // alert("Route successfully added");

    // Clears all of the text-boxes
    $("#train-name-input").val("");
    $("#destination-input").val("");
    $("#first-time-input").val("");
    $("#frequency-input").val("");
});

// Create Firebase event for adding route to the database and a row in the html when a user adds an entry
database.ref().on("child_added", function (childSnapshot) {
    //console.log("We just got word from the database that data was added. Here is what the database returned:");
    //console.log(childSnapshot.val());

    // Store everything into a variable.
    var trainName = childSnapshot.val().name;
    var trainDest = childSnapshot.val().destination;
    var trainFirst = childSnapshot.val().firstTime;
    var trainFreq = childSnapshot.val().frequency;

    // Route Info
    // console.log("Note that train " + trainName + " has a start time of " + moment(trainFirst, "X").format("HH:mm") + " and a frquency of " + trainFreq);

    //Calculate time of next arrival
    var currentTimeObject = moment();
    var startTimeObject = moment(trainFirst, "X");
    var firstMin = minutesFromMidnight(startTimeObject);
    var currentMin = minutesFromMidnight(currentTimeObject);
    var timeDiff;
    if (currentMin >= firstMin) {
        timeDiff = currentMin - firstMin;
    }
    else {
        // say currentMin = 2 (00:02) and firstMin = 60 (01:00), the diff woulf be 23hours and 2 min or 23*60+2
        timeDiff = (1440 - firstMin) + currentMin;  
    }

    var minSinceLastTrain = timeDiff%trainFreq
    var trainNext = parseInt(trainFreq) - minSinceLastTrain;
    console.log("It is currently " + moment().format("HH:mm") +
        ". So, " + timeDiff + " minutes have elapsed since the first train on the " + 
        trainName + " route. Since the frequency is " +
        trainFreq + " minutes, it must have been " + minSinceLastTrain + 
        " minutes since the last train came through. The next train should therefore be in " +
        trainNext + " minutes.");
    // there is a rare case where the minutes to the next train arrival occurs after the first train of the day
    // we need to check for this and show the number of minutes until the first train of the day.
    //example: say we have a route that starts at 1:00am and goes comes again every 59 minutes...
    //there woule be a train at 1:59, 2:58, 3:57, 4:56...23:37, 00:36. If the current time is 12:40am,
    //the last train would have been 4 minutes ago at 12:36am, but the next train will not be 59 minutes later
    //at 1:35am. It will be at 1:00am because that is when the new day's train shcedule starts, so
    //at 12:40am, the next train will not be in 55 minutes, it will be in 20 minutes.
    //Here, we fix this issue:
    if((parseInt(currentMin) < parseInt(firstMin)) && (parseInt(currentMin)+parseInt(trainNext) > parseInt(firstMin))) {
        trainNext = parseInt(firstMin) - parseInt(currentMin);
        console.log("The weird case apllies here, so next train will actually be in " + trainNext + " minutes.");
    }


    // Create the new row
    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(trainDest),
        $("<td>").text(moment(trainFirst, "X").format("HH:mm")),
        $("<td>").text(trainFreq),
        $("<td>").text(trainNext)
    );

    // Append the new row to the table
    $("#route-table > tbody").append(newRow);
});

//this function takes moment object and returns the number of minutes elapsed since midnight.
function minutesFromMidnight(mo) {
    // console.log("So we have a time that is stored as " + mo + " but the they time in military format is " + mo.format("HH:mm"));
    var hours = mo.format("H");
    var mins = mo.format("m");
    var elapsed = 60*parseInt(hours) + parseInt(mins);
    return elapsed;
    // console.log("The hours on that time were " + hours + " and the minutes were " + mins);
    // console.log("So, the total minutes elapsed since midnight have been " + elapsed);
    // console.log("More formally, the time sent to the database could be extressed as " + moment(firstTime, "X").format("MM-DD-YYYY HH:mm"));
    // console.log("The current time is " + moment() + " or " + moment().format("HH:mm"));
}
