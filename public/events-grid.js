const HOST = 'http://localhost:3000';

let columnDefs = [
	{headerName: "ID", field: "id",
		cellRenderer: function(params) {
			return `<a href="http://localhost:3000/events/${params.value}">${params.value}</a>`;
  	}},
	{headerName: "Name", field: "name",
        cellRenderer: function(params) {
            return `<a href="${params.data.link}" target="_blank">${params.value}</a>`;
        }
    },
	{headerName: "Group", field: "group"},
	{headerName: "Time", field: "time", filter: 'agDateColumnFilter'},
    {headerName: "Local Date", field: "local-date"},
    {headerName: "Local Time", field: "local-time"},
    {headerName: "Description", field: "description"}
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
    onGridReady: function () {
        gridOptions.api.sizeColumnsToFit();
    },
    onRowDataChanged: function() {
    	gridOptions.api.refreshCells();
    }
};

function setRowData(events) {
	//events = JSON.parse(events);
	events.forEach((event) => {
		rowData.push({
			id: event.id,
			name: event.name,
			group: event.group.name,
			time: new Date(event.time),
            "local-date": event.local_date,
            "local-time": event.local_time,
            description: event.description,
            link: event.link
		});
	});
	gridOptions.api.setRowData(rowData);
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
    let label = $(`<label for="${topicSelectId}">Select topic(s).</label>`);
    let textarea = $(`<textarea class="form-control" id="${topicSelectId}" rows="1" required></textarea>`);
    
    // let select = $(`<select class="form-control" id="${topicSelectId}"></select>`);

    // relevantTopics.forEach(topic => {
    //     select.append(`<option>${topic}</option>`);
    // });

    // formGroup.append(label).append(select);
    formGroup.append(label).append(textarea);
    form.append(formGroup);

    let submit = $('<button type="submit" class="btn btn-primary">Find Events</button>');
    form.append(submit);

    form.submit(handleEventFormSubmit);
};

function handleEventFormSubmit(event) {
    event.preventDefault();
    let topic = $('#topicSelect')[0].value;
    let url = `${HOST}/topics/${topic}`;
    fetch(url)
    .then(resp => {
        return resp.json();
    }).then(json => {
        //set pagetitle with json.PageTitle
        setRowData(json.events.events);
    });
    //window.location.href = url;
};