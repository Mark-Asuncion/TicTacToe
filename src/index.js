import Game from './gamemanager.js';

const WS = new WebSocket('ws://localhost:6969/');
const game = new Game(
    [
        document.getElementById('pts-1'),
        document.getElementById('pts-2')
    ]
)
let turn = 1;

WS.onopen = () => {
    WS.send(JSON.stringify({
        type: "room",
        findRoom: true
    }));
};
// WS.onclose = () => {
// }
WS.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log(data);
    if (data.roomFound == true) {
        /**
        * @param { Game } ctx
        * @param { Number } row
        * @param { Number } col
        * @returns { boolean }
        */
        const playerMove = (ctx, row, col) => {
            if (turn !== ctx.player) return false;
            WS.send(JSON.stringify({
                type: "play",
                move: true,
                row: row,
                col: col,
            }));
            return true;
        };
        turn = data.turn;
        game.player = data.player;
        game.generateTable(
            document.getElementsByClassName('container-table')[0],
            data.table,
            playerMove
        );
    }
    if (data.update == true) {
        game.updateCell(turn, data.row, data.col);
        turn = data.turn;
    }
    if (data.winner !== undefined && data.winner !== 0) {
        if (data.winner == -1) {
            alert("draw");
        }
        else {
            game.addWinCount(data.winner);
            alert(`Player ${data.winner} Wins`);
        }
    }
};
