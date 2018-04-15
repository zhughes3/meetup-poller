'use strict';

const fs = require('fs');
const FILE_NAME = './persistence/events.json';

exports.write = (events) => {
	if (Array.isArray(events)) {
		//only write events that arent already in json file
		let newEvents = [];
		let currentEvents = read();
		events.forEach(event => {
			if (!isPersistedAlready(event.id, currentEvents)) {
				newEvents.push(event);
			}
		});

		let output = {};
		output.events = currentEvents.concat(newEvents);
		fs.writeFileSync(FILE_NAME, JSON.stringify(output));
	}
};

exports.getDataStore = () => {
	const file_handle = require(FILE_NAME);
	return file_handle;
};

exports.getEvents = () => {
	const file_handle = require(FILE_NAME);
	return file_handle.events;
};

exports.getEvent = (id) => {
	const file_handle = require(FILE_NAME);
	const events = file_handle.events;
	for (let i = 0; i < events.length; i++) {
		let event = events[i];
		if (event.id === id) {
			return event;
		}
	}

	return {
		err: `Event with id ${id} not found.`
	};
};

const read = () => {
	const file_handle = require(FILE_NAME);
	return file_handle.events;
};

const isPersistedAlready = (eventId, currentEvents) => {
	for (let i = 0; i < currentEvents.length; i++) {
		let event = currentEvents[i];
		if (event.id === eventId) {
			return true;
		}
	}
	return false;
};