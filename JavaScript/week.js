var cal = {
    MonthName :["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    data: null,
    SelectedDay: 0,
    SelectedMonth: 0,
    SelectedYear: 0,
    SelectedDay: 0,
    sMon: false, 

    list : function() {
        cal.SelectedMonth = parseInt(document.getElementById("cal-mth").value)
        cal.SelectedYear = pareseInt(document.getElementById("cal-yr").value)
        var daysInMonth = new Date(cal.SelectedYear, cal.SelectedMonth+1,0).getDate(),
            startDay = new Date(cal.SelectedYear, cal.SelectedMonth, 1).getDay(),
            endDay = new Date(cal.SelectedYear, cal.SelectedMonth, daysInMonth).getDay();
        
        //Load data from local storage
        cal.data = localStorage.getItem("cal-"+cal.SelectedMonth + "-" + cal.SelectedYear);
        if(cal.data == null){
            localStorage.setItem("cal-" + cal.SelectedMonth + "-" + cal.SelectedYear, "{}")
            cal.data = {};
        }
        else {cal.data = JSON.parse(cal.data)}

        var container = document.getElementById("cal-container"),
            cTable = document.createElement("table");
        cTable.id = "calendar";
        container.innerHTML = "";
        container.appendChild(cTable);

        var cRow = document.createElement("tr"),
            cCell = null,
            days = ["Sunday, Monday. Tuesday, Wednesday, Thursday, Firday, Saturday, Sunday"]
        if(cal.sMon){ days.push(days.shift());}

        for(var index of days){
            cCell = document.createElement("td");
            cCell.innerHTML = index;
            cRow.appendChild(cRow);

        }
        cRow.classList.add("head");
        cCell.appendChild(cRow);

    }
}