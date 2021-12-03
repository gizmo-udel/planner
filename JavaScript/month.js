var cal = {
  // (A) PROPERTIES
  mName : ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "Octuber", "November", "December"], // Month Names
  data : null, // Events for the selected period
  sDay : 0, // Current selected day
  sMth : 0, // Current selected month
  sYear : 0, // Current selected year
  sMon : false , // Start the week on Monday instead of Sunday (Sunday is standard)
  
  // Replace data with event information here (?)
  // Time : 1159 (Default - as this is the most common turn in time)
  // Title : null
  // Color : (Default color?)
  // ??


  // TODO:
  // Change the following to firebase instead of localSotrage:
  // 1. Initial load of the data.
  // 2. Saving new data
  // 3. Deleting existing data.

  // Once the above is working, we can change the fields/data and display it as we like.

  // (B) DRAW CALENDAR FOR SELECTED MONTH
  list : function () {
    // (B1) BASIC CALCULATIONS - DAYS IN MONTH, START + END DAY
    // Note - Jan is 0 & Dec is 11 in JS.
    // Note - Sun is 0 & Sat is 6
    cal.sMth = parseInt(document.getElementById("cal-mth").value); // Selected month
    cal.sYear = parseInt(document.getElementById("cal-yr").value); // Selected year
    var daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), // Number of days in selected month
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // First day of the month
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(); // Last day of the month

    // (B2) LOAD DATA FROM LOCALSTORAGE
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data==null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else {
      cal.data = JSON.parse(cal.data);
    }

    // (B3) DRAWING CALCULATIONS
    // Determine the number of blank squares before start of month
    var squares = [];
    // If the week starts on sunday and it is monday
    if (cal.sMon && startDay != 1) {
      var blanks = startDay==0 ? 7 : startDay ;
      for (var i=1; i<blanks; i++) { squares.push("blank"); }
    }
    // If the week starts on monday and it is sunday
    if (!cal.sMon && startDay != 0) {
      for (var i=0; i<startDay; i++) { squares.push("blank"); }
    }

    // Populate the days of the month
    for (var i=1; i<=daysInMth; i++) { squares.push(i); }

    // Determine the number of blank squares after end of month
    if (cal.sMon && endDay != 0) {
      var blanks = endDay==6 ? 1 : 7-endDay;
      for (var i=0; i<blanks; i++) { squares.push("blank"); }
    }
    if (!cal.sMon && endDay != 6) {
      var blanks = endDay==0 ? 6 : 6-endDay;
      for (var i=0; i<blanks; i++) { squares.push("blank"); }
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
    if (cal.sMon) { days.push(days.shift()); }
    
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

    // Create table (boxes) for the rest of the days.
    for (var i=0; i<total; i++) {
      // The td html element is a standard cell within the table
      cCell = document.createElement("td");
      if (squares[i]=="blank") { cCell.classList.add("blank"); }
      else {
        cCell.innerHTML = "<a class='dd' href = 'day.html'>"+squares[i];
        if (cal.data[squares[i]]) {
          var LoadDayData = JSON.parse(cal.data[squares[i]]);
          cCell.innerHTML += "<p class='evt' id = 'evt-" + squares[i] + "-id'>" + LoadDayData.detail + " " + LoadDayData.dtime + "</p>";
        }
        cCell.addEventListener("click", function(){
          cal.AddingEvent(this);
        });
      }
      cRow.appendChild(cCell);
      if (i!=0 && (i+1)%7==0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }
    for ( var i = 0; i <total; i++){
      var addingListener = "evt-" + i + "-id";
      if(document.getElementById(addingListener)){
        var temp = document.getElementById(addingListener).id.split("-")[1];
        console.log(temp);
        document.getElementById(addingListener).addEventListener("click", function(event){
          event.stopPropagation();
          cal.EditingEvent(temp);
        });
      }
    }

    // (B5) REMOVE ANY PREVIOUS ADD/EDIT EVENT DOCKET
    cal.close();
  },

  // (C) Edit Docket
  EditingEvent : function (el) {
    // (C1) Get current data
    cal.sDay = el;
    var dayData = JSON.parse(cal.data[cal.sDay]);
    // (C2) Draw the event input form

    var tForm = "<h1> EDIT EVENT </h1>";

    //changed it so that the month started first then the month
    tForm += "<div id='evt-date'>" + cal.mName[cal.sMth] + "/" + cal.sDay + "/" + + cal.sYear + "</div>";
    tForm += "<textarea id='evt-details' required>" + dayData.detail + "</textarea>";

    // this is where all of the time is being put in the calendar
    tForm += "<input type='time' id='sevt-time' name='dueTime' value = '"+ dayData.stime + "'required>";
    console.log(dayData.stime + " " + dayData.dtime)
    tForm += "<input type='time' id='devt-time' name='dueTime' value = '" + dayData.dtime + "'required>";

    //buttons on the form
    tForm += "<input type='button' value='Close' onclick='cal.close()'/>";
    tForm += "<input type='button' value='Delete' onclick='cal.del()'/>";
    tForm += "<input type='submit' value='Save'/>";
    
    // (C3) Attach form to calendar
    var eForm = document.createElement("form");
    eForm.addEventListener("submit", cal.save);
    eForm.innerHTML = tForm;
    var container = document.getElementById("cal-event");
    container.innerHTML = "";
    container.appendChild(eForm);
  },

  AddingEvent : function (el) {
    // (C1) Get current data
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
    // (C2) Draw the event input form
    var tForm = "<h1> ADD EVENT </h1>";

    //changed it so that the month started first then the month
    tForm += "<div id='evt-date'>" + cal.mName[cal.sMth] + "/" + cal.sDay + "/" + + cal.sYear + "</div>";
    tForm += "<textarea id='evt-details' required> </textarea>";

    // this is where all of the time is being put in the calendar
    tForm += "<input type='time' id='sevt-time' name='dueTime' required>";
    tForm += "<input type='time' id='devt-time' name='dueTime' required>";

    //buttons on the form
    tForm += "<input type='button' value='Close' onclick='cal.close()'/>";
    tForm += "<input type='button' value='Delete' onclick='cal.del()'/>";
    tForm += "<input type='submit' value='Save'/>";
    
    // (C3) Attach form to calendar
    var eForm = document.createElement("form");
    eForm.addEventListener("submit", cal.save);
    eForm.innerHTML = tForm;
    var container = document.getElementById("cal-event");
    container.innerHTML = "";
    container.appendChild(eForm);
  },
  // (D) Close event input form
  close : function () {
    document.getElementById("cal-event").innerHTML = "";
  },

  // (E) Save event
  save : function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    // if(!cal.data[cal.sDay]){
    //   var event1 = JSON.stringify({stime: document.getElementById("sevt-time").value, dtime: document.getElementById("devt-time").value, detail : document.getElementById("evt-details").value});
    //   cal.data[cal.sDay] = event1;
    // }
    cal.data[cal.sDay] = JSON.stringify({stime: document.getElementById("sevt-time").value, dtime: document.getElementById("devt-time").value, detail : document.getElementById("evt-details").value});
    localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
     cal.list();
  },

  // (F) Delete event for selected date
  del : function () {
    if (confirm("Remove event?")) {
      delete cal.data[cal.sDay];
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
    if (i==nowMth) { opt.selected = true; }
    month.appendChild(opt);
  }

  // (G3) Append year selector
  // Set to 10 years range. Change this as you like.
  var year = document.getElementById("cal-yr");
  for (var i = nowYear-10; i<=nowYear+10; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = i;
    if (i==nowYear) { opt.selected = true; }
    year.appendChild(opt);
  }

  // (G4) Start/Draw calendar
  document.getElementById("cal-yr").addEventListener("click", cal.list);
  document.getElementById("cal-mth").addEventListener("click", cal.list);
  cal.list();
});
