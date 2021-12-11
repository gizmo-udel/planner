var cal = {
  // (A) PROPERTIES
  mName: ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], // Month Names
  data: null, // Events for the selected period
  sDay: 0, // Current selected day
  sMth: 0, // Current selected month
  sYear: 0, // Current selected year
  sMon: false, // Start the week on Monday instead of Sunday (Sunday is standard)
  militaryTime: false,

  // TODO:
  // Change the following to firebase instead of localStorage:
  // 1. Initial load of the data. DONE
  // 2. Saving new data. DONE
  // 3. Editing current data. DONE
  // 4. Deleting existing data.

  // TODO (BUGS):
  // 1. Events aren't being loaded on month selection! FIXED!

  /* CURRENT FIREBASE STRUCTURE
  See: loadData() fucntion for efficient (lol?) implementation structure.
  db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(currentDay.toString()).doc(docID).eventName.value;
    Users -> (UID) -> Events -> (mm-yyyy) -> dd -> (UID) -> #DETAILS#
  													                              eventName
  													                              sTime
  													                              eTime
  													                              eventDesc
                                                          etc... */

  // (B) DRAW CALENDAR FOR SELECTED MONTH
  list: function () {
    // (B1) BASIC CALCULATIONS - DAYS IN MONTH, START + END DAY
    // Note - Jan is 0 & Dec is 11 in JS.
    // Note - Sun is 0 & Sat is 6
    cal.sMth = parseInt(document.getElementById("cal-mth").value); // Selected month
    cal.sYear = parseInt(document.getElementById("cal-yr").value); // Selected year
    var daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(), // Number of days in selected month
      startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // First day of the month
      endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(); // Last day of the month

    // (B2) Load saved data from Firebase for the currently logged in user.
    for (var i = 1; i <= daysInMth; i++) {
      cal.loadData(i);
    }

    // (B3) DRAWING CALCULATIONS
    // Determine the number of blank squares before start of month
    var squares = [];
    // If the week starts on sunday and it is monday
    if (cal.sMon && startDay != 1) {
      var blanks = startDay == 0 ? 7 : startDay;
      for (var i = 1; i < blanks; i++) {
        squares.push("blank");
      }
    }
    // If the week starts on monday and it is sunday
    if (!cal.sMon && startDay != 0) {
      for (var i = 0; i < startDay; i++) {
        squares.push("blank");
      }
    }

    // Populate the days of the month
    for (var i = 1; i <= daysInMth; i++) {
      squares.push(i);
    }

    // Determine the number of blank squares after end of month
    if (cal.sMon && endDay != 0) {
      var blanks = endDay == 6 ? 1 : 7 - endDay;
      for (var i = 0; i < blanks; i++) {
        squares.push("blank");
      }
    }
    if (!cal.sMon && endDay != 6) {
      var blanks = endDay == 0 ? 6 : 6 - endDay;
      for (var i = 0; i < blanks; i++) {
        squares.push("blank");
      }
    }

    // (B4) DRAW HTML CALENDAR
    // Container
    var container = document.getElementById("cal-container"),
      cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // First row - Day names
    var cRow = document.createElement("tr"),
      cCell = null,
      days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thurday", "Friday", "Saturday"];
    if (cal.sMon) {
      days.push(days.shift());
    }

    // Create tables (boxes) for first row.
    for (var d of days) {
      cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);

    // Days in Month
    var total = squares.length;
    cRow = document.createElement("tr");

    cRow.classList.add("day"); // this is the whole row and can be used for the week view

    // Create table (boxes) for the rest of the days and load saved data.
    for (var i = 0; i < total; i++) {
      Hasdata = false;
      // The td html element is a standard cell within the table
      cCell = document.createElement("td");
      // "Empty" spaces for the beginning/end of the month.
      if (squares[i] == "blank") {
        cCell.classList.add("blank");
      }
      // Build non-empty spaces for the month.
      else {
        cCell.classList.add("td");
        cCell.setAttribute('id', 'td');
        // If the square isn't "blank" (grey square) place day numbers.
        cCell.innerHTML = "<div class='dd' id=" + squares[i] + ">" + squares[i] + "</div>";

        // Event listener for editing spaces.
        cCell.addEventListener("click", function () {
          cal.modifyEvent(this);
        });
      }

      //Appending days (M-S)
      cRow.appendChild(cCell);
      if (i != 0 && (i + 1) % 7 == 0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }

    // (B5) REMOVE ANY PREVIOUS ADD/EDIT EVENT DOCKET
    cal.close(false);
  },



  helpingFunction: function (eventNum) {
    var timebt = document.getElementById('militaryTime');
    timebt.onclick = function () {
      timebt.innerHTML = cal.militaryTime ? "AM/PM" : "Military";
      console.log(timebt);
      cal.ChangeTime()
    };

    //close function on click
    var closebt = document.getElementById('Close');
    closebt.onclick = cal.close;

    //delete all event function on click 
    var delall = document.getElementById("DeleteAll");
    delall.onclick = function () {
      cal.del(cal.sDay, 0)
    };

    //save event function on click 
    /*
    var savebt = document.getElementById('Save');
    savebt.onclick = function (evt) {
      evt.stopPropagation();
      evt.preventDefault();
      cal.save(eventNum)
    };
    */

  },

  modifyEvent: function (currentDay) {
    // Month Names
    var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    //cal.sDay = currentDay;
    //console.log(currentDay);

    // Grab clicked date (Month Day Year)
    var sMth = cal.sMth + 1;
    var sDay = currentDay.firstChild.id;
    console.log(sDay.toString());
    var sYear = cal.sYear;

    // Debugging
    //console.log("Editing!: " + (parseInt(sMth) + 1).toString(), sDay.toString(), sYear);
    //console.log("Month name: " + mName[parseInt(sMth) - 1]);

    //display modal 
    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const userID = firebaseUser.uid;
        //console.log(userID, sMth + "-" + sYear + " " + sDay.toString());
        var sDayString = sDay.toString();
        console.log("Post: " + sDayString);
        document.body.addEventListener('click', function (event) {
          console.log("Clicked event ID: " + event.target.id);
          console.log("Need to match: 'evt' or 'td' or " + sDayString);

          // If clicking an already exsiting event the... (EDIT)
          if (event.target.id == 'evt') {
            console.log("evt - EventID: " + event.target.id);
            // Month Names
            var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // Grab clicked date (Month Day Year)
            var sMth = cal.sMth + 1;
            var sDay = currentDay.firstChild.id;
            var sYear = cal.sYear;

            event.stopPropagation();

            let id = event.target.getAttribute('data-id');
            //console.log("Target atty: " + id);

            const saveEdit = document.getElementById('Save');
            saveEdit.innerHTML = "Edit";
            // Add different button for edit? hide save show edit in here?
            // It's saving a wiped field atm.
            //console.log("RIGHT BEFORE: " + sMth + "-" + sYear + sDay.toString());

            db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).doc(id).get().then((snapshot) => {
              //console.log(snapshot.data());
              console.log("in snapshot id: " + id)
              console.log("in: " + sMth + "-" + sYear + " " + sDay.toString());
              var tempEvent = snapshot.get('eventName');
              var tempDesc = snapshot.get('eventDesc');
              document.getElementById("evt-name").value = snapshot.get('eventName');
              document.getElementById("evt-details").value = snapshot.get('eventDesc');

              console.log("tempEvent: " + tempEvent + "\nDesc: " + tempDesc);

              // Are these pulling correctly? What format is it?
              //document.getElementById("sevt-time").value = snapshot.get('sTime');
              //document.getElementById("devt-time").value = snapshot.get('eTime');

              console.log("sevt-time: " + document.getElementById("sevt-time").value);
              console.log("devt-time: " + document.getElementById("devt-time").value);

              //console.log("Event name: " + tempEvent);
              var title = document.getElementById("event-title");
              title.innerHTML = "<div> Editing: <b>[" + tempEvent + "]</b> for " + mName[parseInt(sMth) - 1] + " " + sDay + " " + sYear + " </div>";
              saveEdit.addEventListener("click", (event) => {
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
                console.log("Event EDITED to: " + eventName, eventDesc, sTime, eTime);
                saveEdit.innerHTML = "Save";
                document.getElementById("evt-name").value = '';
                document.getElementById("evt-details").value = '';
                // RELOAD HERE?
              })
            })
            // If clicking an empty area then... (ADD NEW)
          } else if (event.target.id == 'td' || event.target.id == sDayString) {
            console.log(sDay);
            // Grab current logged in userID to match to the database.
            const userID = firebaseUser.uid;

            // Month Names
            var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // Grab clicked date (Month Day Year)
            var sMth = cal.sMth + 1;
            var sDay = currentDay.firstChild.id;
            var sYear = cal.sYear;

            console.log("target.id: " + event.target.id + " - sDay: " + sDay.toString());
            if (event.target.id == sDay) {
              console.log("id = sDay");
            }

            // TODO: Create separate edit button prob.
            const title = document.getElementById("event-title");
            const saveEdit = document.getElementById('Save');
            document.getElementById("evt-name").value = '';
            document.getElementById("evt-details").value = '';
            title.innerHTML = "<div> Adding event for: <b>[" + mName[parseInt(sMth) - 1] + "]</b>" + " " + sDay + " " + sYear + "</div>";

            // Debugging
            console.log(sMth + "-" + sYear + " " + sDay.toString());
            saveEdit.addEventListener("click", () => {
              saveEdit.innerHTML = "Edit";
              console.log("INSIDE THE EDIT ADD NEW LISTENER!!");
              var sTime = document.getElementById("sevt-time").value;
              var eTime = document.getElementById("devt-time").value;
              var eventName = document.getElementById("evt-name").value;
              var eventDesc = document.getElementById("evt-details").value;

              console.log(sMth + "-" + sYear + " " + sDay);

              db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(sDay.toString()).add({
                // name: input
                // KEEP NAMING CONSISTENT, THESE VALUES ARE SPECIFICALLY CALLED
                // CURRENT EVENT DETAILS: sTime, eTime, eventName, eventDesc
                // Can easily add more later
                sTime: document.getElementById("sevt-time").value,
                eTime: document.getElementById("devt-time").value,
                eventName: document.getElementById("evt-name").value,
                eventDesc: document.getElementById("evt-details").value,
              });
              console.log("Document: " + userID + "\nWritten with the following:\n" + mName[parseInt(sMth) - 1] + "-" + sYear, sDay.toString(), sTime, eTime, eventName, eventDesc);
              document.getElementById("evt-name").value = '';
              document.getElementById("evt-details").value = '';
              saveEdit.innerHTML = "Save";
              var modal = document.getElementById('myModal');
              modal.style.display = "none";
            })
          }
        });
      }
    })

    //get title element, change to edit event

    //get and assign evt-date element
    var event_date = document.getElementById("evt-date");
    event_date = cal.mName[cal.sMth] + cal.sDay + cal.sYear;

    //get and assign time 
    var stime = document.getElementById('sevt-time');
    var etime = document.getElementById('devt-time');
    /*
    stime = event.stime;
    etime = event.dtime;
    */

    //display delete all button
    var delall = document.getElementById("DeleteAll");
    delall.style.display = "inline";

    //display delete button
    var delbt = document.getElementById("Delete");
    delbt.style.display = "inline";

    //delete function on click
    var delbt = document.getElementById('Delete');
    delbt.onclick = function () {
      cal.del(day, eventNum)
    };

    //helping function to call other on click methods 
    this.helpingFunction(sDay);
  },

  // (D) Close event input form
  close: function (callList) {
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
    if (callList) {
      //cal.list();
    }
  },

  ChangeTime: function () {
    console.log("changed");
    cal.militaryTime = !cal.militaryTime;
    let value = document.getElementById("militaryTime");
    value.value = this.militaryTime ? "MIlitary" : "AM/PM";
    document.getElementById("Close").onclick = function () {
      cal.close(true);
    };
  },

  // (F) Delete selected event from the selected day
  del: function (day, eventNum) {
    /*
    if (confirm("Remove" + (!eventNum ? " all events?" : " event?"))) {
      cal.sDay = day;
      if (!eventNum) {
        delete cal.data[cal.sDay];
      }
      else {
        let event = JSON.parse(cal.data[cal.sDay]);
        for (let i = eventNum; i < event.numCount; i++) {
          event["event" + i] = event["event" + (i + 1)];
        }
        delete event["event" + event.numCount--];
        cal.data[cal.sDay] = JSON.stringify(event);
      }
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
      */
    cal.list(); //Delete the event and redraw the calendar

  },

  // Load the saved data for the currently logged in user, display it on the calendar.
  loadData: function (currentDay) {

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        // Display/hide appropriate buttons.
        // These should be moved to a separate listener later, this function is called a lot!
        document.getElementById('loginNav').style.display = 'none';
        document.getElementById('logoutNav').style.display = 'block';

        // Grab current logged in userID to match to the database.
        const userID = firebaseUser.uid;

        //Month Names
        var mName = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Selected month (+1 to account for 0-11 making it 1-12)
        var sMth = cal.sMth + 1;
        // Selected year
        var sYear = cal.sYear;

        //Coll. -> (DOC) -> Coll. -> (DOC) -> Coll. -> (#DOC#) -> #DETAILS#
        //Users -> (UID) -> Events -> (mm-yyyy) -> dd -> (UID) -> #DETAILS#
        db.collection('users').doc(userID)
          .get().then(
            doc => {
              if (doc.exists) {
                db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).get().
                then(doc2 => {
                  if (doc2.exists) {
                    db.collection('users').doc(userID).collection('events').doc(sMth + "-" + sYear).collection(currentDay.toString()).get().then(snapshot => {
                      if (snapshot.docs.length > 0) {
                        snapshot.docs.forEach(doc => {
                          //console.log(doc.id);
                          //console.log("Calling collections ok!");
                          //console.log("Current Day: "+day);

                          // When saving we will have to use the format (mm-dd-yyyy) to match this query.
                          // This needs to be changed to unique values, and then we check the doc.data().eventDate string of each document instead of doc.id?

                          Hasdata = true;
                          console.log("Matching Doc ID OK for day " + currentDay + "!");

                          // Load the data into the created cell.
                          NewCell = document.createElement("div");

                          // Edit the text displayed in the event cell.
                          // FB doc-id included for pulling the correct doc on click, bad secruity?
                          NewCell.innerHTML = "<div class='evt' id='evt' data-id='" + doc.id + "'>" + doc.data().eventName + " " + doc.data().eTime + "</div>";

                          // Grab the current day to append to the correct cell.
                          document.getElementById(currentDay).innerHTML += NewCell.innerHTML;
                          console.log("Event loaded for day: " + currentDay + "!");

                        })
                      } else {
                        //console.log("'" + currentDay + "' collection exists, but no documents found!");
                      }
                    })
                  } else {
                    console.log("No events for the month of " + mName[sMth] + "-" + sYear + ".");
                    // Should break the function call here if I can.
                    // No need to check/say there are no events 30+ times!
                  }
                })
              } else {
                console.log("No user ID Found!");
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
    nowMth = now.getMonth(),
    nowYear = parseInt(now.getFullYear());

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
  //TODO: add a listener to the acutal month/year elements, not the dropdown button itself. DONE

  //document.getElementById("cal-yr").addEventListener("click", cal.list);
  //document.getElementById("cal-mth").addEventListener("click", cal.list);

  const yrOpts = document.getElementById('cal-yr');
  const mthOpts = document.getElementById('cal-mth')

  // Listener to load calendar data when a different year is selected.
  yrOpts.addEventListener('change', (e) => {
    console.log(`e.target.value = ${ e.target.value }`);
    cal.list();
  });
  // Listener to load calendar data when a different month is selected.
  mthOpts.addEventListener('change', (e) => {
    console.log(`e.target.value = ${ e.target.value }`);
    cal.list();
  });
  cal.list();
});