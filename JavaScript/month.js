var cal = {
  // (A) PROPERTIES
  mName : ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], // Month Names
  data : null, // Events for the selected period
  sDay : 0, // Current selected day
  sMth : 0, // Current selected month
  sYear : 0, // Current selected year
  sMon : false , // Week start on Monday?

  // (B) DRAW CALENDAR FOR SELECTED MONTH
  list : function () {
    // (B1) BASIC CALCULATIONS - DAYS IN MONTH, START + END DAY
    // Note - Jan is 0 & Dec is 11 in JS.
    // Note - Sun is 0 & Sat is 6
    cal.sMth = parseInt(document.getElementById("cal-mth").value); // selected month
    cal.sYear = parseInt(document.getElementById("cal-yr").value); // selected year
    var daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), // number of days in selected month
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // first day of the month
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(); // last day of the month by going to the next month and going back 1 day

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
    //if the week starts on sunday and it is monday
    if (cal.sMon && startDay != 1) {
      var blanks = startDay==0 ? 7 : startDay ;
      for (var i=1; i<blanks; i++) { squares.push("blank"); }
    }
    //if the week starts on monday and it is sunday
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
    var cRow = document.createElement("tr"), // tr is table row in html
        cCell = null,
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thurday", "Friday", "Saturday"];
    if (cal.sMon) { days.push(days.shift()); }
    
    // Create tables (boxes) for first row.
    for (var d of days) {
      cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head"); // this addes the names for what day it is on top
    cTable.appendChild(cRow);

    // Days in Month
    var total = squares.length;
    cRow = document.createElement("tr");
    cRow.classList.add("day"); // this is the whole row and can be used for the week view

    // Create table (boxes) for the rest of the days.
    for (var i=0; i<total; i++) {
      //the td html element is a standard cell within the table
      cCell = document.createElement("td");
      if (squares[i]=="blank") { cCell.classList.add("blank"); }
      else {
        cCell.innerHTML = "<div class='dd'>"+squares[i]+"</div>";
        if (cal.data[squares[i]]) {
          var LoadDayData = JSON.parse(cal.data[squares[i]]);
          cCell.innerHTML += "<div class='evt'>" + LoadDayData.detail + " " + LoadDayData.dtime + "</div>";
        }
        cCell.addEventListener("click", function(){
          cal.show(this);
        });
      }
      cRow.appendChild(cCell);
      if (i!=0 && (i+1)%7==0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }

    // (B5) REMOVE ANY PREVIOUS ADD/EDIT EVENT DOCKET
    cal.close();
  },

  // (C) Edit Docket
  show : function (el) {
    // (C1) Get current data
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
    var dayData;
    if(cal.data[cal.sDay]){dayData = JSON.parse(cal.data[cal.sDay]);}
    // (C2) Draw the event input form
    var tForm = "<h1>" + (cal.data[cal.sDay] ? "EDIT" : "ADD") + " EVENT</h1>";
    //changed it so that the month started first then the month
    tForm += "<div id='evt-date'>" + cal.mName[cal.sMth] + "/" + cal.sDay + "/" + + cal.sYear + "</div>";
    // conditional ? true : false
    tForm += "<textarea id='evt-details' required>" + (dayData ? dayData.detail : "") + "</textarea>";
    // this is where all of the time is being put in the calendar
    tForm += "<input type='time' id='sevt-time' name='dueTime' required>"  + (dayData ? dayData.stime : "");
    tForm += "<input type='time' id='devt-time' name='dueTime' required>"  + (dayData ? dayData.dtime : "");

    tForm += "<input type='button' value='Close' onclick='cal.close()'/>";
    tForm += "<input type='button' value='Delete' onclick='cal.del()'/>";
    tForm += "<input type='submit' value='Save'/>";
    // Aaron added a button to change to the week view
    tForm += "<a href = 'week.html'> Week View </a>";
    tForm += "<a href = 'day.html'> Day View </a>";
    
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
    cal.data[cal.sDay] = JSON.stringify({stime: document.getElementById("sevt-time").value,
                                        dtime: document.getElementById("devt-time").value,
                                        detail : document.getElementById("evt-details").value});
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
