// Firebase Admin SDK
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');

const FINALIZED_MEETING_PATH = "finalized_meetings";
const USER_PATH = "users";

exports.clear_event = functions.pubsub.topic('daily-tick').onPublish(event => {

    return admin.database().ref(FINALIZED_MEETING_PATH).once('value').then(dataSnapshot => {   
        //gets current time
        var currTime = Date.now();
        
        console.log(currTime);
        
        var data = dataSnapshot.val();

        var deletePromises = [];
        
        for (meetingKey in data) {
        
            var meeting = data[meetingKey];
            //fetches start time of the event
            var startTimeMillis = meeting.timeOption.startTimeMillis;

            //error handling
            if (startTimeMillis === null || startTimeMillis === undefined) {
                startTimeMillis = 0;
            }

            console.log("looking at " + meeting.title + " with start time of " + startTimeMillis + " and key of " + meetingKey);

            //returns true if event is in the past 
            if (currTime > startTimeMillis) {
                //delete reference to the event in finalized_meeting section of subscribed users
                for (userKey in meeting.invitedUsers) {
                    console.log("deleting meeting " + meetingKey + " in user " + userKey);
                    var deleteInUserHistory = admin.database().ref(USER_PATH).child(userKey).child(FINALIZED_MEETING_PATH).child(meetingKey).set(null);
                    deletePromises.push(deleteInUserHistory);
                }

                //delete the event itself
                var deleteInMeeting = admin.database().ref(FINALIZED_MEETING_PATH).child(key).set(null);
                deletePromises.push(deleteInMeeting);
                console.log("deleted this meeting");
            }
        }
        return Promise.all(deletePromises);
    });
});

