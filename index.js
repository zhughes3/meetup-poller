const fetch = require('node-fetch');
const util = require('util');
const obj = require('./private/creds.json');
const MEETUP_KEY = obj.key;
const MEETUP_API_HOST = 'https://api.meetup.com';
const TOPIC = 'softwaredev';
const ZIP = 43215;
let events = [];

const searchGroups = () => {
	const METHOD = '/2/groups';
	util.format('%s:%s', 'foo');
	let url = addKey(util.format('%s%s?topic=%s&zip=%d', MEETUP_API_HOST, METHOD, TOPIC, ZIP));
	return fetch(url)
	.then(response => {
		return response.json();
	});
};

const handleGroupResults = (results) => {
	results.forEach(result => {
		const id = result.id;
		const link = result.link;
		const desc = result.description;
		const urlname = result.urlname;
		searchEvents(urlname)
		.then(json => {
			console.log('json=' + json);
			json.forEach(result => {
				events.append(result);
			});
		}).catch(err => {
			console.log(util.format('There was an error grabbing events for group with id=%s', id));
		});
	});
};
// /:urlname/events
const searchEvents = (urlname) => {
	const METHOD = util.format('/%s/events?', urlname);
	let url = addKey(util.format('%s%s', MEETUP_API_HOST, METHOD));
	console.log('url = ' + url);
	return fetch(url)
	.then(response => {
		return response.json();
	});
};

const addKey = (url) => {
	return util.format('%s&sign=true&key=%s', url, MEETUP_KEY);
}

searchGroups()
.then(json => {
	console.log(json);
	let results = json.results;
	console.log(util.format('We found %d groups with topic=%s', results.length, TOPIC));
	const meta = json.meta;
	handleGroupResults(results);
}).catch(err => {
	console.log('We have an error= ' + err);
});