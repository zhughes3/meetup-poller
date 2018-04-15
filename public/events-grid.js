const HOST = 'http://localhost:3000';

let columnDefs = [
	{headerName: "ID", field: "id",
		cellRenderer: function(params) {
			return `<a href="http://localhost:3000/events/${params.value}">${params.value}</a>`;
  	}},
	{headerName: "Name", field: "name"},
	{headerName: "Group", field: "group"},
	{headerName: "Time", field: "time", filter: 'agDateColumnFilter'}
];

let rowData = [];

let gridOptions = {
	columnDefs: columnDefs,
    rowData: [],
    domLayout: 'autoHeight',
    enableColResize: true,
    enableSorting: true,
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
			group: event.group,
			time: new Date(event.time)
		});
	});
	gridOptions.api.setRowData(rowData);
};

document.addEventListener("DOMContentLoaded", () => {
	// lookup the container we want the Grid to use
    let eGridDiv = document.querySelector('#grid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
    fetch(`${HOST}/events`)
    .then(res => {
    	return res.json();
    }).then(json => {
    	setRowData(json.data);
  	});
});