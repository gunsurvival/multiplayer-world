import colyseus from 'colyseus.js';

const client = new colyseus.Client('ws://localhost:3000');
const room = await client.join('room');
room.send('change_x');
