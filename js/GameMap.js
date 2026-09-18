class Cell {
    constructor(obstacleRate) {
        this.obstacleRate = obstacleRate;
        this.content = this.selectContent();
    }

    selectContent() {
        const random = Math.random();

        if (random < this.obstacleRate) {
            return "obstacle";
        }

        return "void";
    }

    isObstacle() {
        return this.content === "obstacle";
    }

    isVoid() {
        return this.content === "void";
    }

    placeWeapon(weapon) {
        this.content = weapon;
    }

    placeCharacter(character) {
        this.content = character;
    }

    render() {
        const element = document.createElement("div");

        element.classList.add("map__cell");

        if (this.isObstacle()) {
            element.classList.add("map__cell--obstacle");
        }

        if (this.content instanceof Character) {
            element.classList.add("map__cell--character");

            const image = document.createElement("img");
            image.classList.add("map__cell-sprite");
            image.src = this.content.getPath();
            image.alt = this.content.getName();

            element.appendChild(image);
        }

        return element;
    }
}


class Column {
    constructor(rows, obstacleRate) {
        this.rows = rows;
        this.obstacleRate = obstacleRate;
        this.cells = [];

        this.createCells();
    }

    createCells() {
        for (let i = 0; i < this.rows; i++) {
            const cell = new Cell(this.obstacleRate);
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
            const column = new Column(this.rows, this.obstacleRate);
            this.columnList.push(column);
        }
    }

    placeWeapons() {
        let weaponsPlaced = 0;

        while (weaponsPlaced < this.numberWeapons) {
            const x = Math.floor(Math.random() * this.columns);
            const y = Math.floor(Math.random() * this.rows);

            const cell = this.columnList[x].getCell(y);

            if (cell.isVoid()) {
                // For now, we simply reserve the weapon's location.
                cell.placeWeapon("weapon");

                weaponsPlaced++;
            }
        }
    }

    placeCharacters() {
        const characters = retrieveSelectedCharacters();

        characters.forEach(character => {
            let characterPlaced = false;

            while (!characterPlaced) {
                const x = Math.floor(Math.random() * this.columns);
                const y = Math.floor(Math.random() * this.rows);
                const cell = this.getCell(x, y);

                if (cell.isVoid()) {
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