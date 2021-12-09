var cal = {
  // (A) PROPERTIES
  mName : ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], // Month Names
  data : null, // Events for the selected period
  sDay : 0, // Current selected day
  sMth : 0, // Current selected month
  sYear : 0, // Current selected year
  sMon : false , // Start the week on Monday instead of Sunday (Sunday is standard)
  militaryTime: false,
  
  // TODO:
  // Change the following to firebase instead of localStorage:
  // 1. Initial load of the data.
  // 2. Saving new data
  // 3. Deleting existing data.

  // Once the above is working, we can change the fields/data and display it as we like.

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


    // (B2) LOAD DATA FROM LOCALSTORAGE
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear); //cal-12-02
    if (cal.data == null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else {
      cal.data = JSON.parse(cal.data);
    }

    // (B2) Load data from Firebase


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

    //Keep track of current day.
    var currDay = 0;

    // Create table (boxes) for the rest of the days and load stored data for any logged in user.
    for (var i = 0; i < total; i++) {
      Hasdata = false;
      // The td html element is a standard cell within the table
      cCell = document.createElement("td");
      if (squares[i] == "blank") {
        cCell.classList.add("blank");
      } else {
        // If the square isn't "blank" (grey square) place day numbers.
        cCell.innerHTML = "<div class='dd' id="+squares[i]+">" + squares[i] + "</div>";

        //Display data if any is currently stored for the logged in user.
        firebase.auth().onAuthStateChanged(firebaseUser => {
          if (firebaseUser) {

            document.getElementById('loginNav').style.display = 'none';
            document.getElementById('logoutNav').style.display = 'block';
            // Grab current logged in userID to match to the database.
            const userID = firebaseUser.uid;            
            db.collection('users').doc(userID).collection('events').get().then((snapshot) => {
              //This needs to be here so it's not iterating for every document in the collection, causing skips.
              currDay++;
              snapshot.docs.forEach(doc => {
                //console.log("Calling collections ok!");
                //console.log("FIREBASE DOC ID: " + doc.id);
                //console.log("MY DOC ID: " + Number(cal.sMth+1) + "-" + currDay + "-" + cal.sYear);
                
                // When saving we will have to use the format (mm-dd-yyyy) to match this query.
                // This needs to be changed to unique values, and then we check the doc.data().eventDate string of each document instead of doc.id?
                if (doc.id == Number(cal.sMth+1) + "-" + currDay + "-" + cal.sYear) {
                  Hasdata = true;
                  console.log("Matching Doc ID OK for day " + currDay + "!");

                  // Load the data into the created cell.
                  NewCell = document.createElement("div");
                  NewCell.innerHTML = "<div class='evt'>" + doc.data().eventName + " " + doc.data().eventTime + "</div>";

                  // Grab the current day to append to the correct cell.
                  dayID = currDay.toString();
                  document.getElementById(dayID).innerHTML += NewCell.innerHTML;
                }
              })
            })
          }
        });
        //??
        cCell.addEventListener("click", function () {
          if (!Hasdata) {
            cal.AddingEvent(this);
          }
          cal.EditingEvent(this);
        });
      }
      //Appening days
      cRow.appendChild(cCell);
      if (i != 0 && (i + 1) % 7 == 0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }
    for ( let day = 0; day <total; day++){
      if(cal.data[day]){
        let tempNumEvents = JSON.parse(cal.data[day]).numCount;
        for(let tempNumEvent = 1; tempNumEvent <= tempNumEvents; tempNumEvent++){
            let addingListener = "evt-" + day  + "-" + tempNumEvent + "-id";
            document.getElementById(addingListener).addEventListener("click", function(event){
              event.stopPropagation();
              event.preventDefault();
              cal.Event(this, day, tempNumEvent);
           });
        }
      }
    }

    // (B5) REMOVE ANY PREVIOUS ADD/EDIT EVENT DOCKET
    cal.close(false);
  },

  Event : function (el, day, eventNum) {
    let event = null;
    if(!day){cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;}
    else{
      cal.sDay = day;
      event =JSON.parse(cal.data[cal.sDay]);
      event= event["event" + eventNum];
      event = JSON.parse(event);
    }
    let tForm = "<h1>" + (event ? "EDITTING EVENT" : "ADD EVENT") + "</h1>";
    tForm += "<div id='evt-date'>" + cal.mName[cal.sMth] + "/" + cal.sDay + "/" + cal.sYear + "</div>";
    tForm += "<textarea id='evt-title' maxlength = 8 required>"+ (event ? event.title + "</textarea>": "</textarea>" );
    tForm += "<textarea id='evt-details' placeholder = required>" + (event ? event.detail + "</textarea>":"</textarea>" );
    tForm += "<input type='time' id='sevt-time' value =" + (event ? event.stime: "00:00") + " name='dueTime' required>";
    tForm += "<input type='time' id='devt-time' value =" + (event ? event.dtime: "23:59") + " name='dueTime' required>";
    tForm += "<input type='button' value='Delete All' onclick='cal.del(" + cal.sDay + ',' + 0 + ")'/>"
    tForm += "<input type='button' id = 'militaryTime' value='" + (cal.militaryTime ? "Military" : "AM/PM") +"' onclick='cal.ChangeTime()'/>";
    tForm += "<input type='button' value='Close' id = 'closingButton' onclick='cal.close(false)'/>";
    tForm += "<input type='submit' value='Save'/>";
    var eForm = document.createElement("form");
    eForm.addEventListener("submit", function(evt){
      evt.stopPropagation();
      evt.preventDefault();  
      cal.save(eventNum);
    }); //pass it the event number to know that it is editting
    eForm.innerHTML = tForm;
    document.getElementById("cal-event").appendChild(eForm);
  },
  // (D) Close event input form
  close : function (callList) {
    document.getElementById("cal-event").innerHTML = "";
    if(callList){cal.list();}
  },

  // (E) Save event either by adding or by editing 
  save : function (eventNum) {
    if(!cal.data[cal.sDay]){
      cal.data[cal.sDay] = JSON.stringify({numCount:0});
    }
    let oldData = JSON.parse(cal.data[cal.sDay]);
    let NewEvent = JSON.stringify({stime: document.getElementById("sevt-time").value, dtime: document.getElementById("devt-time").value, title: document.getElementById('evt-title').value, detail : document.getElementById("evt-details").value});
    if(!eventNum){
      oldData.numCount = oldData.numCount + 1;
      oldData["event" + oldData.numCount] = NewEvent;
    }
    else{oldData["event" + eventNum] = NewEvent;}
    cal.data[cal.sDay] = JSON.stringify(oldData);
    localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
    cal.list();
  },

  ChangeTime : function() {
    cal.militaryTime = !cal.militaryTime;
    let value = document.getElementById("militaryTime");
    value.value = this.militaryTime ? "MIlitary" : "AM/PM";
    document.getElementById("closingButton").onclick = function (){cal.close(true);};
  },

  // (F) Delete selected event from the selected day
  del : function (day, eventNum) {
    if (confirm("Remove"+ (!eventNum ? " all events?" : " event?"))) {
      cal.sDay = day;
      if(!eventNum){
        delete cal.data[cal.sDay];
      }
      else{
        let event =JSON.parse(cal.data[cal.sDay]);
        for(let i = eventNum; i <event.numCount; i++){
          event["event" + i] = event["event" + (i + 1)];
        }
        delete event["event" + event.numCount--];
        cal.data[cal.sDay] = JSON.stringify(event);
      }
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
      cal.list(); //Delete the event and redraw the calendar
    }
  }
};

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
    year.appendChild(opt);
  }

  // (G4) Start/Draw calendar
  document.getElementById("cal-yr").addEventListener("click", cal.list);
  document.getElementById("cal-mth").addEventListener("click", cal.list);
  cal.list();
});