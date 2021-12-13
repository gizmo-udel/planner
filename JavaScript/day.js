var cal = {
    // (A) PROPERTIES
    mName: ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], // Month Names
    data: null, // Events for the selected period
    sDay: 0, // Current selected day
    sMth: 0, // Current selected month
    sYear: 0, // Current selected year
    sMon: false, // Start the week on Monday instead of Sunday (Sunday is standard)
    militaryTime: false,
    dummyData: 0,

    modifyEvent: function (currentDay) {
        // Month Names
        var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        //cal.sDay = currentDay;
        //console.log(currentDay);

        // Grab clicked day (Month Day Year)
        var sDay = currentDay.firstChild.id;

        //display modal 
        var modal = document.getElementById("myModal");
        modal.style.display = "flex";

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                const userID = firebaseUser.uid;
                //console.log(userID, sMth + "-" + sYear + " " + sDay.toString());
                var sDayString = sDay.toString();
                document.body.addEventListener('click', function (event) {
                    // Editing Event
                    if (event.target.id == 'evt') {
                        // Month Names
                        var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                        // Grab clicked date (Month Day Year)
                        var sMth = cal.sMth + 1;
                        var sDay = currentDay.firstChild.id;
                        var sYear = cal.sYear;

                        event.stopPropagation();

                        let id = event.target.getAttribute('data-id');
                        //console.log("Target atty: " + id);

                        // Show appropriate buttons for editing.
                        const editBtn = document.getElementById('edit');
                        const delBtn = document.getElementById("Delete");
                        delBtn.style.display = "inline";
                        editBtn.style.display = "inline";

                        db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).doc(id).get().then((snapshot) => {
                            var tempEvent = snapshot.get('eventName');
                            //var tempDesc = snapshot.get('eventDesc');
                            document.getElementById("evt-name").value = snapshot.get('eventName');
                            document.getElementById("evt-details").value = snapshot.get('eventDesc');

                            //console.log("Event name: " + tempEvent);
                            var title = document.getElementById("event-title");
                            title.innerHTML = "<div> Editing: <b>[" + tempEvent + "]</b> for " + mName[parseInt(sMth) - 1] + " " + sDay + " " + sYear, "</div>";

                            editBtn.addEventListener("click", (event) => {
                                var eventName = document.getElementById("evt-name").value;
                                var eventDesc = document.getElementById("evt-details").value;
                                var sTime = document.getElementById("sevt-time").value;
                                var eTime = document.getElementById("devt-time").value;

                                db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).doc(id).set({
                                    eventName: document.getElementById("evt-name").value,
                                    eventDesc: document.getElementById("evt-details").value,
                                    // Time causing issues if it's not re-set.
                                    sTime: document.getElementById("sevt-time").value,
                                    eTime: document.getElementById("devt-time").value
                                })
                                console.log("%cEvent successfully changed", 'color: #00D833', "to: ", '\n' + eventName, eventDesc, '\n' + sTime, eTime);
                                cal.closeModal();

                            }, {
                                once: true
                            })
                        })

                        // Delete event.
                        delBtn.addEventListener("click", (e) => {
                            // Delete function call.
                            db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).doc(id).delete();

                            console.log("Event %c(" + id + ")", 'color: #FF5733', "successfully deleted.");
                            cal.closeModal();
                        }, {
                            once: true
                        })

                        // Adding New Event
                    } else if (event.target.id == 'td' || event.target.id == sDayString) {
                        // Grab current logged in userID to match to the database.
                        const userID = firebaseUser.uid;

                        // Month Names
                        var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                        // Grab clicked date (Month Day Year)
                        var sMth = cal.sMth + 1;
                        var sDay = currentDay.firstChild.id;
                        var sYear = cal.sYear;

                        // Show appropriate buttons for saving.
                        const title = document.getElementById("event-title");
                        const saveBtn = document.getElementById('Save');
                        const modal = document.getElementById("myModal");
                        saveBtn.style.display = "inline";

                        // Label title.
                        title.innerHTML = "<div>Adding event for: <b>[" + mName[parseInt(sMth) - 1] + "]</b>" + " " + sDay + " " + sYear, "</div>";

                        // Debugging
                        //console.log(sMth + "-" + sYear + " " + sDay.toString());
                        // Save event.
                        saveBtn.addEventListener("click", (event) => {
                            var sTime = document.getElementById("sevt-time").value;
                            var eTime = document.getElementById("devt-time").value;
                            var eventName = document.getElementById("evt-name").value;
                            var eventDesc = document.getElementById("evt-details").value;

                            db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).add({
                                sTime: document.getElementById("sevt-time").value,
                                eTime: document.getElementById("devt-time").value,
                                eventName: document.getElementById("evt-name").value,
                                eventDesc: document.getElementById("evt-details").value,
                            });
                            console.log("%cDocument successfully written", "color: #00D833", "with the following: ", '\n', +sDay.toString(), mName[parseInt(sMth) - 1], sYear, '\n', sTime, eTime, '\n', eventName, eventDesc);

                            // Close modal on button press.
                            cal.closeModal();

                        }, {
                            once: true
                        })
                    } else if (event.target.id == 'Close') {
                        cal.closeModal;
                    }
                }, {
                    once: true
                });
            }
        })
    },

    // Load the saved data for the currently logged in user, display it on the calendar.
    loadData: function (selMonth, selDay, selYear) {
        // Make sure a user is logged in!
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                // Display/hide appropriate buttons.
                // These should be moved to a separate listener later, this function is called a lot!
                document.getElementById('loginNav').style.display = 'none';
                document.getElementById('logoutNav').style.display = 'block';

                // Grab current logged in userID to match to the database.
                const userID = firebaseUser.uid;

                var selMonthFirebase = parseInt(selMonth) + 1;

                console.log("FBMonth: " + selMonthFirebase)

                //Month Names
                var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                console.log(mName[selMonth], selDay, selYear)
                /*
                    var now = new Date(),
                        nowDay = parseInt(now.getDate()),
                        nowMth = now.getMonth() + 1,
                        nowYear = parseInt(now.getFullYear());
                //var nowDay = 
                */
                // Pull current date

                //Coll. -> (DOC) -> Coll. -> (DOC) -> Coll. -> (#DOC#) -> #DETAILS#
                //Users -> (UID) -> Events -> (mm-yyyy) -> dd -> (UID) -> #DETAILS#
                db.collection('users').doc(userID)
                    .get().then(
                        doc => {
                            if (doc.exists) {
                                db.collection('users').doc(userID).collection('events').doc(selMonthFirebase + "-" + selYear).get().
                                then(doc2 => {
                                    if (doc2.exists) {
                                        db.collection('users').doc(userID).collection('events').doc(selMonthFirebase + "-" + selYear).collection(selDay.toString()).get().then(snapshot => {
                                            if (snapshot.docs.length > 0) {
                                                snapshot.docs.forEach(doc => {

                                                    // When saving we will have to use the format (mm-yyyy) to match this query.
                                                    Hasdata = true;
                                                    //console.log("Matching Doc ID OK for day " + currentDay + "!");

                                                    // var dayGridContainer = document.getElementById('gridContainer');
                                                    var eventContainer = document.getElementById('eventContainer');

                                                    // The value of an hour and minute in the "grid" layout.
                                                    // Note: 'hours' is used for multiplication, 'minutes' are used for division.
                                                    // However, 15 minutes are still worth 1/4 of an hour on the grid.
                                                    var hour = 4;
                                                    var minute = 15;

                                                    // Event start/end time.
                                                    var startTime = doc.data().sTime;
                                                    var endTime = doc.data().eTime;

                                                    console.log(endTime);
                                                    console.log(startTime);

                                                    // Parse start time hours and minutes.
                                                    startTimeArr = startTime.split(':');
                                                    console.log(startTimeArr);
                                                    startTimeHour = parseInt(startTimeArr[0]);
                                                    startTimeMin = parseInt(startTimeArr[1]);

                                                    // Parse end time hours and minutes.
                                                    endTimeArr = endTime.split(':');
                                                    console.log(endTimeArr);
                                                    endTimeHour = parseInt(endTimeArr[0]);
                                                    endTimeMin = parseInt(endTimeArr[1]);

                                                    console.log("startTimeHour (0): " + startTimeHour);
                                                    console.log("startTimeMin (0): " + startTimeMin);
                                                    console.log("endTimeHour (0): " + endTimeHour);
                                                    console.log("endTimeMin (0): " + endTimeMin);

                                                    var gridUpper = (hour * startTimeHour) + parseInt(startTimeMin / minute) + 1;
                                                    var gridLower = (hour * endTimeHour) + parseInt(endTimeMin / minute) + 1;

                                                    console.log("gridUpper (1): " + gridUpper + " | gridLower(12): " + gridLower);

                                                    // Create temp cells.
                                                    const newCell = document.createElement("div");
                                                    const cellTitle = document.createElement("div");
                                                    const cellTime = document.createElement("div");
                                                    const cellDesc = document.createElement("div");

                                                    // Cell cell properties.
                                                    newCell.setAttribute('class', 'dayview-cell');
                                                    newCell.setAttribute('data-id', doc.id);
                                                    newCell.setAttribute('style', "grid-row: " + gridUpper + " / " + gridLower + ";");

                                                    cellTitle.setAttribute('class', 'dayview-cell-title');
                                                    cellTime.setAttribute('class', 'dayview-cell-time');
                                                    cellDesc.setAttribute('class', 'dayview-cell-desc');

                                                    cellTitle.innerHTML = doc.data().eventName;
                                                    cellTime.innerHTML = startTime + "-" + endTime;
                                                    cellDesc.innerHTML = doc.data().eventDesc;

                                                    eventContainer.appendChild(newCell);
                                                    newCell.appendChild(cellTitle);
                                                    newCell.appendChild(cellTime);
                                                    newCell.appendChild(cellDesc);

                                                    //document.getElementById(currentDay).innerHTML += NewCell.innerHTML;
                                                    console.log("%cEvent loaded", 'color: #00D833', "for '" + mName[parseInt(selMonth)], selDay + "'!");

                                                })
                                            } else {
                                                console.log("%cNo event found", 'color: #FF5733', "for '" + mName[parseInt(selMonth)], selDay + "'!");
                                            }
                                        })
                                        // Dummy data needs to be created in firestore documents or it CANNOT be accessed.
                                    } else if (cal.dummyData != 1) {
                                        console.log("%cNo events", 'color: #FF5733', "for the month of " + mName[parseInt(selMonth)], selDay + ".\nCreating dummy data...");
                                        db.collection('users').doc(userID).collection('events').doc(selMonthFirebase + "-" + selYear).set({
                                            name: mName[parseInt(selMonthFirebase)] + " " + selYear
                                        }).then
                                        {
                                            console.log("%cDummy data successfully created.", 'color: #00D833');
                                            cal.dummyData = 1;
                                        }
                                    }
                                })
                            } else {
                                console.log("%cNo user ID Found!", 'color: #FF5733');
                            }
                        });
            }
        })

    }
}



// (G) Draw month & year selector
window.addEventListener("load", function () {
    // (G1) Get current date
    var now = new Date(),
        nowDay = parseInt(now.getDate()),
        nowMth = now.getMonth(),
        nowYear = parseInt(now.getFullYear());
    var daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(); // Number of days in selected month
    //var nowDay = 
    // Pull current date
    console.log(nowDay);

    // (G1) Append day selector.
    var day = document.getElementById("cal-day");
    for (var i = 1; i <= daysInMth; i++) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = i;
        //console.log("i: " + i + " | nowDay: " + nowDay);
        if (i == nowDay) {
            opt.selected = true;
        }
        opt.setAttribute('id', 'option');
        day.appendChild(opt);
    }

    // (G2) Append month selector
    var month = document.getElementById("cal-mth");
    for (var i = 0; i < 12; i++) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = cal.mName[i];
        if (i == nowMth) {
            opt.selected = true;
        }
        opt.setAttribute('id', 'option');
        month.appendChild(opt);
    }

    // (G3) Append year selector
    // Set to 10 years range. Change this as you like.
    var year = document.getElementById("cal-yr");
    for (var i = nowYear - 10; i <= nowYear + 10; i++) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = i;
        if (i == nowYear) {
            opt.selected = true;
        }
        opt.setAttribute('id', 'option');
        year.appendChild(opt);
    }

    // (G4) Start/Draw calendar
    const yrOpts = document.getElementById('cal-yr');
    const mthOpts = document.getElementById('cal-mth');
    const dayOpts = document.getElementById('cal-day');

    var selMonth = document.getElementById("cal-mth").value;
    var selDay = document.getElementById("cal-day").value;
    var selYear = document.getElementById("cal-yr").value;
    console.log(selMonth, selDay, selYear);

    // Listener to load calendar data when a different year is selected.
    yrOpts.addEventListener('change', () => {
        // Remove the events from the previously selected day from being displayed.
        var removeView = document.getElementsByClassName('dayview-cell');
        while (removeView[0]) {
            removeView[0].parentNode.removeChild(removeView[0]);
        }

        selYear = document.getElementById("cal-yr").value;
        cal.loadData(selMonth, selDay, selYear);
    });
    // Remove the events from the previously selected day from being displayed.
    mthOpts.addEventListener('change', () => {
        var removeView = document.getElementsByClassName('dayview-cell');
        while (removeView[0]) {
            removeView[0].parentNode.removeChild(removeView[0]);
        }

        selMonth = document.getElementById("cal-mth").value;
        cal.loadData(selMonth, selDay, selYear);
    });
    // Remove the events from the previously selected day from being displayed.
    dayOpts.addEventListener('change', () => {
        var removeView = document.getElementsByClassName('dayview-cell');
        while (removeView[0]) {
            removeView[0].parentNode.removeChild(removeView[0]);
        }

        selDay = document.getElementById("cal-day").value;
        cal.loadData(selMonth, selDay, selYear);
    });
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            cal.loadData(selMonth, selDay, selYear);
        }
        else{
            document.getElementById('loginNav').style.display = 'block';
            document.getElementById('logoutNav').style.display = 'none';
        }
    })
});