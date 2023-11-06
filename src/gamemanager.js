export default class Game {
    /**
     * @param { [HTMLElement]} lables
     */
    constructor(labels = [null]) {
        this.player = 0;
        this.chars = [' ','X','O'];
        this.cells = {};
        this.labels = labels
    }

    reset() {
        for (let i=0;i<this.table.length;i++){
            for(let j=0;j<this.table.length;j++){
                this.cells[`${i}${j}`].innerHTML = this.chars[0];
            }
        }
    }

    /**
    * @param { Number }
    */
    addWinCount(player) {
        this.labels[player-1].innerHTML =
            Number(this.labels[player-1].textContent) + 1;
    }

    /**
    * @param { Number } player
    * @param { Number } row
    * @param { Number } col
    */
    updateCell(player, row, col) {
        this.cells[`${row}${col}`].innerHTML = this.chars[player];
    }

    /**
    * @param { HTMLElement } parent
    * @param { Number[3][3] } table
    * @param { ( Game, Number, Number ) => boolean } callable
    */
    generateTable(parent, table, callable) {
        const corner = {
            0: {
                0: 'top-left',
                2: 'top-right',
            },
            2: {
                0: 'bot-left',
                2: 'bot-right',
            }, };
        for (let i=0;i<table.length;i++){
            for(let j=0;j<table.length;j++){
                const newCell = document.createElement('button');
                newCell.classList.add('items');
                newCell.onclick = () => {
                    callable(this, i, j);
                };
                this.cells[`${i}${j}`] = newCell
                newCell.innerHTML = this.chars[table[i][j]];

                if ((i == 0 || i == table.length-1) &&
                    (j == 0 || j == table.length-1)){
                    newCell.classList.add(corner[i][j]);
                }
                parent.appendChild(newCell);
            }
        }
    }
};
