class Column {
    constructor(x, rows, obstacleRate) {
        this.x = x;
        this.rows = rows;
        this.obstacleRate = obstacleRate;
        this.cells = [];

        this.createCells();
    }

    createCells() {
        for (let y = 0; y < this.rows; y++) {
            const cell = new Cell(this.x, y, this.obstacleRate);
            this.cells.push(cell);
        }
    }

    getCell(index) {
        return this.cells[index];
    }

    render(container) {
        this.cells.forEach(cell => {
            container.appendChild(cell.render());
        });
    }
}


class GameMap {
    constructor(columns, rows, obstacleRate, numberWeapons) {
        this.columns = columns;
        this.rows = rows;
        this.obstacleRate = obstacleRate;
        this.numberWeapons = numberWeapons;

        this.columnList = [];

        this.createColumns();
        this.placeWeapons();
        this.placeCharacters();
    }

    createColumns() {
        for (let i = 0; i < this.columns; i++) {
            const column = new Column(i, this.rows, this.obstacleRate);
            this.columnList.push(column);
        }
    }

    placeWeapons() {
        WEAPON_TYPES.forEach(weaponType => {
            let weaponPlaced = false;

            while (!weaponPlaced) {
                const x = Math.floor(Math.random() * this.columns);
                const y = Math.floor(Math.random() * this.rows);

                const cell = this.columnList[x].getCell(y);

                if (cell.isEmpty()) {
                    cell.placeWeapon(weaponType);
                    weaponPlaced = true;
                }
            }
        });
    }

    placeCharacters() {
        const characters = retrieveSelectedCharacters();
        const placedPlayers = [];

        characters.forEach(character => {
            let attempts = 0;

            while (attempts < MAX_GENERATION_ATTEMPTS) {
                attempts += 1;

                const x = Math.floor(Math.random() * this.columns);
                const y = Math.floor(Math.random() * this.rows);
                const cell = this.getCell(x, y);

                // Cases vides uniquement, et jamais adjacentes à un joueur
                // les deux joueurs ne démarrent pas côte à côte.
                if (!cell || !cell.isEmpty() || this.isAdjacentToPlayer(cell, placedPlayers)) {
                    continue;
                }

                const player = new Player(character, x, y);
                cell.placeCharacter(player);
                placedPlayers.push(player);
                break;
            }
        });
    }

    isAdjacentToPlayer(cell, players) {
        return players.some(player => {
            return Math.abs(player.x - cell.x) + Math.abs(player.y - cell.y) <= 1;
        });
    }

    // Les joueurs posés sur la carte, dans l'ordre (joueur 1 d'abord).
    getPlayers() {
        const players = [];

        this.columnList.forEach(column => {
            column.cells.forEach(cell => {
                if (cell.content instanceof Player) {
                    players.push(cell.content);
                }
            });
        });

        return players;
    }

    getCell(x, y) {
        if (
            x < 0 ||
            x >= this.columns ||
            y < 0 ||
            y >= this.rows
        ) {
            return null;
        }

        return this.columnList[x].getCell(y);
    }

    render(container) {
        container.innerHTML = "";

        container.style.display = "grid";
        container.style.gridTemplateColumns =
            `repeat(${this.columns}, minmax(0, 1fr))`;
        container.style.gridTemplateRows =
            `repeat(${this.rows}, minmax(0, 1fr))`;

        this.columnList.forEach(column => {
            column.render(container);
        });
    }
}


// La création de la carte et le rendu sont déclenchés par main.js (le lanceur).