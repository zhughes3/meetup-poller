# meetup-poller

## Prerequisites
- download node
- Sign up for account at meetup.com. You need a user account to get an API key.

## Running
- Clone repo.
- In root folder (where index.js lives):
	- create a folder called 'private'
	- create a file called creds.json and insert key found [here](https://secure.meetup.com/meetup_api/key/)
	- configure creds.json to look like this:
	```json
	{
	"key" : "YOUR-KEY-GOES-HERE"
	}
	```
	- start the app with this shell command
```sh
node index.js
```

## Endpoints
1. /events
Returns an array of event objects.