'use strict';



const net = require('net');
const EE = require('events');
const Client = require('./model/client.js');
const PORT = process.env.PORT || 3000;
const server = net.createServer();
const ee = new EE();

const pool = [];

ee.on('default', function(client) {
    client.socket.write('not a command - use an @ symbol\n');
});

ee.on('@all', function(client, string) {
    pool.forEach( c => {
        c.socket.write(`${client.nickname}: ${string}`);
    });
});

ee.on('@nickname', function(client, string){
    let nickname = string.split(' ').shift().trim();
    client.nickname = nickname;
    client.socket.write(`user has changed nickname to ${nickname}\n`)
})

ee.on('@dm', function(client, string){
    var nickname = string.split(' ').shift().trim();
    //can make this .split(' ').shift().trim(); into a shortcut in the top for repeated use
    var message = string.split(' ').splice(1).join(' ').trim();

    pool.forEach( c => {
        if (c.nickname === nickname) {
            c.socket.write(`${client.nickname}: ${message}`);
        }
    });
});

server.on('connection', function(socket) {
    var client = new Client(socket);
    pool.push(client);

    socket.on('data', function(data) {
        const command = data.toString().split(' ').shift().trim();

        if (command.startsWith('@')) {
            ee.emit(command, client, data.toString().split(' ').splice(1).join(' '));
            return;
        }

        ee.emit('default', client);

    });
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
});
