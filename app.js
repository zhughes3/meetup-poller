'use strict';

// libraries
const fetch = require('node-fetch');
const Hapi = require('hapi');
const Pug = require('pug');
const Path = require('path');
const json_helper = require('./JsonHelper');
const util = require('util');

// global variables
const obj = require('./private/creds.json');
const MEETUP_KEY = obj.key;
const MEETUP_API_HOST = 'https://api.meetup.com';
const BASE_TOPIC = 'tech';
const PAGING_AMOUNT = 100;
let events = [];
let state = {};

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
});

const start = async() => {
    await server.register(require('vision'));
    await server.register(require('inert'));

    server.views({
        engines: { pug: Pug },
        relativeTo: __dirname,
        path: './templates/'
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.'
            }
        }
    });

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
    console.log('Original Headers = \n');
    console.log(headers);
    state.remaining = headers['x-ratelimit-remaining'][0];
    state.limit = headers['x-ratelimit-limit'][0];
    state.reset = headers['x-ratelimit-reset'][0];
    console.log(state);
};

const searchEvents = () => {
    const METHOD = '/find/upcoming_events';
    let url = addKey(util.format('%s%s?topic_category=%s&page=%d', MEETUP_API_HOST, METHOD, BASE_TOPIC, 100));
    return makeThrottledRequest(url)
        .then((json) => {
            //events = json.events;
            json.events.forEach(event => {
                events.push({
                    name: event.name,
                    link: event.link,
                    time: event.time,
                    visibility: event.visibility,
                    group: event.group.name,
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
    if (state.remaining === 0) {
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

server.route({
    method: 'GET',
    path: '/events',
    handler: (request, h) => {
        // return h.view('events', {
        // 	pageTitle: `Events for topic: ${BASE_TOPIC}`,
        // 	events: json_helper.getEvents()
        // });
        return {
            data: json_helper.getEvents()
        };
    }
});

server.route({
    method: 'GET',
    path: '/events/{id}',
    handler: (request, h) => {
        const id = encodeURIComponent(request.params.id);
        return h.view('event', {
            pageTitle: `Event with id: ${id}`,
            event: json_helper.getEvent(id)
        });
    }
});

server.route({
    method: 'GET',
    path: '/topics/{topic}',
    handler: (request, h) => {
        const topic = encodeURIComponent(request.params.topic);
        const METHOD = '/find/upcoming_events';
        let url = addKey(util.format('%s%s?topic_category=%s&page=%d&text=%s',
            MEETUP_API_HOST, METHOD, BASE_TOPIC, PAGING_AMOUNT, topic));
        return makeThrottledRequest(url)
            .then((json) => {
                return {
                    pageTitle: `Meetups in the ${topic} category`,
                    events: json
                };
            });
    }
});