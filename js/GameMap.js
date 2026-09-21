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


class Map {
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

        characters.forEach(character => {
            let characterPlaced = false;

            while (!characterPlaced) {
                const x = Math.floor(Math.random() * this.columns);
                const y = Math.floor(Math.random() * this.rows);
                const cell = this.getCell(x, y);

                if (cell.isEmpty()) {
                    cell.placeCharacter(character);
                    characterPlaced = true;
                }
            }
        });
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


document.addEventListener("DOMContentLoaded", () => {
    const map = new Map(10, 10, 0.15, 4);

    const container = document.getElementById("map");
    map.render(container);
});