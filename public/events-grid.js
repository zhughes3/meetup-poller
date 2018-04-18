const HOST = 'http://localhost:3000';

let columnDefs = [
    {
        headerName: "Name",
        field: "name",
        cellRenderer: function(params) {
            return `<a href="${params.data.link}" target="_blank">${params.value}</a>`;
        }
    },
    { headerName: "Group", field: "group" },
    {
        headerName: "Local Date",
        field: "local-date",
        filter: 'agDateColumnFilter',
        cellRenderer: function(params) {
            return `${params.value.toLocaleDateString()}`;
        }
    },
    {
        headerName: "Local Time",
        field: "local-time",
        cellRenderer: function(params) {
            return `${params.value.toLocaleTimeString()}`;
        }
    },
    { headerName: "Day of the Week", field: "dayofweek" }
];

let rowData = [];

let gridOptions = {
    columnDefs: columnDefs,
    rowData: [],
    domLayout: 'autoHeight',
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    paginationAutoPageSize: true,
    pagination: true,
    onGridReady: function() {
        gridOptions.api.sizeColumnsToFit();
    },
    onRowDataChanged: function() {
        gridOptions.api.refreshCells();
    }
};

function setRowData(events) {
    //events = JSON.parse(events);
    events.forEach((event) => {
        if (!isInGrid(event)) {
            let eventDateTime = new Date(event.time);
            //remove time of day to make filtering the date by Equality work
            let eventDate = new Date(eventDateTime.getFullYear(), eventDateTime.getMonth(), eventDateTime.getDate(), 0, 0, 0, 0);
            //remove the date from the time value so sorting by local time works properly
            let eventTime = new Date(0, 0, 0, eventDateTime.getHours(), eventDateTime.getMinutes(), eventDateTime.getSeconds(), 0)
            let eventDayOfWeek = eventDate.toLocaleDateString("en-US", { weekday: 'long' });

            rowData.push({
                id: event.id,
                name: event.name,
                group: event.group.name,
                "local-date": eventDate,
                "local-time": eventTime,
                dayofweek: eventDayOfWeek,
                link: event.link
            });
        }
    });
    gridOptions.api.setRowData(rowData);
};

function isInGrid(event) {
    let isInGrid = false;
    rowData.forEach(evt => {
        if (evt.id === event.id) {
            isInGrid = true;
        }
    });
    return isInGrid;
};

document.addEventListener("DOMContentLoaded", () => {
    // lookup the container we want the Grid to use
    let eGridDiv = document.querySelector('#grid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
    buildEventsForm();
    //  fetch(`${HOST}/events`)
    //  .then(res => {
    //  	return res.json();
    //  }).then(json => {
    //  	setRowData(json.data);
    // });
});

function buildEventsForm() {
    const topicSelectId = 'topicSelect';
    let form = $('form#eventForm');

    let formGroup = $('<div class="form-group"></div>');
    let label = $(`<label for="${topicSelectId}">Search for a topic.</label>`);
    let inputfield = $(`<input type="text" class="form-control" id="${topicSelectId}" rows="1" placeholder="Type to search..." required></input>`);

    // let select = $(`<select class="form-control" id="${topicSelectId}"></select>`);

    // relevantTopics.forEach(topic => {
    //     select.append(`<option>${topic}</option>`);
    // });

    // formGroup.append(label).append(select);
    formGroup.append(label).append(inputfield);
    form.append(formGroup);

    let submit = $('<button type="submit" class="btn btn-primary">Find Events</button>');
    form.append(submit);

    form.submit(handleEventFormSubmit);
};

function handleEventFormSubmit(event) {
    event.preventDefault();
    let topic = $('#topicSelect')[0].value;
    let url = `${HOST}/topics/${topic}`;
    //show the grid
    $('#grid').css("visibility", "visible");
    fetch(url)
    .then(resp => {
        return resp.json();
    }).then(json => {
        //set pagetitle with json.PageTitle
        setRowData(json.events.events);
    });
    //window.location.href = url;
};