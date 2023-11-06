import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
const port = 6969

/**
 * @value { Map<WebSocket, Number> }
 */
const usersConnected = new Map();

class Room {
    constructor() {
        this.user1 = null;
        this.user2 = null;
        this.turn = 1;
        this.table = [
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ];
    }

    sendToUsers(message) {
        if (this.user1 != null)
            this.user1.send(JSON.stringify(message))
        if (this.user2 != null)
            this.user2.send(JSON.stringify(message))
    }

    evalWinner() {
        return 0;
    }
    playerMove(row, col) {
        if (this.table[row][col] != 0) {
            return false;
        }
        this.table[row][col] = this.turn
        return true;
    }

    reset() {
        this.turn = 1;
        this.table = this.table.map(()=> {return [0,0,0]});
    }

    /**
    * @returns { Number }
    */
    incTurn() {
        this.turn++;
        if (this.turn == 3) {
            this.turn = 1;
        }
        return this.turn;
    }
    add(player) {
        if(this.user1 == null) {
            this.user1 = player
            return 1;
        }
        else if(this.user2 == null) {
            this.user2 = player
            return 2;
        }
        return 0;
    }

    size() {
        return ( ( this.user1 != null )? 1:0 ) + ( ( this.user2 != null )? 1:0 );
    }

    isFull() {
        return this.user1 != null && this.user2 != null;
    }

    quit(player) {
        if (this.user1 == player)
            this.user1 = null
        else if (this.user2 == player)
            this.user2 = null
    }
};

const rooms = [];
// TODO use express

const server = http.createServer((req, res) => {
    switch (req.url) {
        case '/':
            fs.readFile('src/index.html',(e,v) => {
                if (e) {
                    res.writeHead(404);
                    res.end();
                }
                else {
                    res.setHeader('Content-Type','text/html');
                    res.write(v);
                    res.end();
                }
            })
            break;
        case '/style.css':
            fs.readFile('src/style.css',(e,v) => {
                if (e) {
                    res.writeHead(404);
                    res.end();
                }
                else {
                    res.setHeader('Content-Type','text/css');
                    res.write(v);
                    res.end();
                }
            })
            break;
        case '/index.js':
            fs.readFile('src/index.js',(e,v) => {
                if (e) {
                    res.writeHead(404);
                    res.end();
                }
                else {
                    res.setHeader('Content-Type','text/javascript');
                    res.write(v);
                    res.end();
                }
            })
            break;
        case '/gamemanager.js':
            fs.readFile('src/gamemanager.js',(e,v) => {
                if (e) {
                    res.writeHead(404);
                    res.end();
                }
                else {
                    res.setHeader('Content-Type','text/javascript');
                    res.write(v);
                    res.end();
                }
            })
            break;
        default :
            res.writeHead(404);
            res.end();
            break;
    }
})
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Connection Established');
    usersConnected.set(ws, -1);

    ws.on('open', () => {
        console.log('ws Open Event');
    });

    ws.on('message', (message) => {
        const ms = JSON.parse(message);
        console.log("\n\n")
        console.log("onMessage: ")
        console.log(ms)

        console.log("Rooms: " + rooms);
        console.log(rooms);
        console.log("Players: " + usersConnected.size);

        switch (ms.type) {
            case "room": {
                console.log("finding Room");
                if(ms.findRoom = true) {
                    if (rooms.length == 0) {
                        rooms.push( new Room () )
                    }
                    for (let i=0; i<rooms.length;i++) {
                        if (i == rooms.length-1)
                            rooms.push( new Room() );
                        const o = rooms[i];

                        console.log("Index " + i);
                        console.log("Room Size: " + o.size());

                        if (o.isFull()) continue;
                        const pt = o.add(ws);
                        usersConnected.set(ws, {
                            room: rooms[i],
                            turn: rooms[i].turn
                        });

                        console.log("Room Size after add: " + o.size());

                        ws.send(JSON.stringify({
                            player: pt,
                            roomFound: true,
                            table: rooms[i].table,
                            turn: rooms[i].turn
                        }))
                        break;
                    }
                }
                break;
            }
            case "play": {
                const room = usersConnected.get(ws).room
                if (ms.move == true) {
                    if (room.playerMove(ms.row, ms.col) == false) {
                        return;
                    }
                    const winner = room.evalWinner();
                    room.sendToUsers({
                        update: true,
                        row: ms.row,
                        col: ms.col,
                        winner: winner,
                        turn: room.incTurn(),
                    })
                }
                break;
            }
            default:
                break;
        }
    });

    ws.on('close', (_) => {
        console.log("\n\n");

        console.log("A connection has closed\n");
        const i = usersConnected.get(ws).room;
        // console.log("ROOM Size: " + i.size());
        i.quit(ws)
        // console.log("ROOM Size after quit: " + i.size());
        console.log(rooms);

        usersConnected.delete(ws)
        console.log("Users remaining: " + usersConnected.size)
    });

    ws.on('error', (e) => {
        console.log(`ws Error: ${e}`);
    });
});

server.listen(port);
console.log("Http Server running at port " + port)
