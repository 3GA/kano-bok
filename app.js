"use strict";
const restify = require('restify');
const SLACK_TOKEN = process.env.SLACK_TOKEN;

const REPLIES = [
	`Batteries not included`,
	`Part arm, part machine, all cop`,
	`Please put down your weapon. You have 20 seconds to comply`,
	`Urban Pacification`,
	`Sarah Connor?`,
	`Techno-trousers, fantastic for walkies`,
	`I am the proud owner of a central nervous system`,
	`I'm 40% back, baby!`,
	`They could rebuild me. They had the technology`,
	`Souls don't die`,
	`I am the droid you're looking for`,
	`I'm bigger. I'm badder. Ladies and gentlemen, I'm too much for Mr. Incredible!`,
	`Here I am, brain the size of a planet, and you ask me to do that`,
	`I am Iron Man *Queue the awesome song*`,
	`Diagnosis, puberty`,
	`What constitutes true artificial intelligence?`
];

const server = restify.createServer({
    name: 'ARM'
});
const io = require("socket.io")(server.server);
let client;

io.on('connection', socket => {
    console.log('connection');
    if (client) {
        return socket.disconnect();
    }
    client = socket;
    client.on('disconnect', () => {
        client = null;
    });
});

function sendMessage(name, data) {
    console.log(name, data);
    if (client) {
        client.emit(name, data);
    }
}

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use((req, res, next) => {
    console.log(req.url);
    next();
});

server.use((req, res, next) => {
    if (req.params.token !== SLACK_TOKEN) {
        return res.send(new restify.UnauthorizedError('Wrong Slack token'));
    }
    next();
});

server.get('/', (req, res) => {
    return res.send(200);
});

server.post('/arm', (req, res) => {
    const cmd = req.params.command,
          rawParams = req.params.text || '',
          params = rawParams.split(' '),
	  rndIndex = Math.floor(Math.random() * REPLIES.length),
	  sorryDave = (Math.random() > 0.95),
	  text = sorryDave ? `I'm sorry Dave. I'm afraid I can't do that` : REPLIES[rndIndex];

    if (!sorryDave) {
	sendMessage('arm', {
            cmd,
            params
        });
    }

    return res.send(200, { text });
});

server.listen(process.env.PORT || 8001);