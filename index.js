'use strict';

// libraries
const fetch = require('node-fetch');
const Hapi = require('hapi');
const util = require('util');
const json_helper = require('./JsonHelper');

// global variables
const obj = require('./private/creds.json');
const MEETUP_KEY = obj.key;
const MEETUP_API_HOST = 'https://api.meetup.com';
const TOPIC = 'softwaredev';
let events = [];
let state = {};

const server = Hapi.server({
	port: 3000,
	host: 'localhost'
});

server.route({
	method: 'GET',
	path: '/events',
	handler: (request, h) => {
		return json_helper.getDataStore();
	}
});

const start = async () => {
	await server.start();
	console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// X-RateLimit-Limit     ::= max number of reqs that can be made in a window of time
// X-RateLimit-Remaining ::= remaining number of reqs allowed in the current rate limit window
// X-RateLimit-Reset     ::= number of seconds until the current rate limit window resets
const updateState = (result) => {
	let headers = JSON.stringify(result.headers.raw());
	headers = JSON.parse(headers);
	state.remaining = headers['x-ratelimit-remaining'][0];
	state.limit = headers['x-ratelimit-limit'][0];
	state.reset = headers['x-ratelimit-reset'][0];
	console.log(state);
};

const addEventToTable = (event) => {
	let sql = 'INSERT INTO events (id, group, description, eventdate, eventtime) VALUES (?, ?, ?, ?, ?) WHERE NOT EXISTS(SELECT 1 FROM events WHERE id = ?);';
};

const searchEvents = () => {
	const METHOD = '/find/upcoming_events';
	let url = addKey(util.format('%s%s?topic_category=%s&page=%d', MEETUP_API_HOST, METHOD, TOPIC, 100));
	return makeThrottledRequest(url)
	.then((json) => {
		//events = json.events;
		json.events.forEach(event => {
			events.push({
				id: event.id,
				name: event.name,
				link: event.link,
				time: event.time,
				visibility: event.visibility,
				group: event.group.name,
				description: event.description,
				'local-date': event['local_date'],
				'local-time': event['local_time']
			});
		});

		//write events to persistent json file
		json_helper.write(events);
	}).catch((err) => {
		 console.log('We have an error searching for events: ' + err);
	});
};

const addKey = (url) => {
	return util.format('%s&sign=true&key=%s', url, MEETUP_KEY);
};

const makeThrottledRequest = (url) => {
	if (state.remaining == 0) {
		setTimeout(() => {
			return makeRequest(url);
		}, state.reset * 1000);
	} else {
		return makeRequest(url);
	}
};

const makeRequest = (url) => {
	return fetch(url)
	.then((results) => {
		updateState(results);
		return results.json();
	});
};

searchEvents();

start();