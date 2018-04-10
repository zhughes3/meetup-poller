const fetch = require("node-fetch");
const obj = require('./private/creds.json');
const MEETUP_KEY = obj.key;
const MEETUP_API_HOST = 'https://api.meetup.com';
const TOPIC = 'softwaredev';
const ZIP = 43215;

const searchGroups = () => {
	const METHOD = '/2/groups';
	let url = addKey(MEETUP_API_HOST + METHOD + '?topic=' + TOPIC + '&zip=' + ZIP);
	return fetch(url)
	.then(response => {
		return response.json();
	});
};

const handleGroupResults = (results) => {
	results.forEach(result => {
		console.log(result);
	});
};

const searchEvents = () => {

};

const addKey = (url) => {
	return url + '&sign=true&key=' + MEETUP_KEY;
}

searchGroups()
.then(json => {
	let results = json.results;
	const meta = json.meta;
	console.log(meta);
	handleGroupResults(results);
}).catch(err => {
	console.log('We have an error= ' + err);
});