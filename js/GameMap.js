class GameMap {
    constructor(columns, rows, obstacleRate, numberWeapons) {
        this._columns = columns;
        this._rows = rows;
        this._obstacleRate = obstacleRate;
        this._numberWeapons = numberWeapons;
        this._cells = [];
        this._players = []; // dans l'ordre de placement (joueur 1 d'abord)

        this.createCells();
        this.placeWeapons();
        this.placeCharacters();
    }

    get columns() {
        return this._columns;
    }

    get rows() {
        return this._rows;
    }

    get obstacleRate() {
        return this._obstacleRate;
    }

    get numberWeapons() {
        return this._numberWeapons;
    }

    get cells() {
        return this._cells;
    }

    get players() {
        return this._players;
    }

    // ----- Création -----

    generateCellContent() {
        return Math.random() < this.obstacleRate ? Cell.OBSTACLE : Cell.EMPTY;
    }

    createCells() {
        for (let x = 0; x < this.columns; x++) {
            for (let y = 0; y < this.rows; y++) {
                this.cells.push(new Cell(x, y, this.generateCellContent()));
            }
        }
    }

    // ----- Accès aux cases -----

    isInsideMap(x, y) {
        return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
    }

    getCell(x, y) {
        return this.isInsideMap(x, y) ? this.cells[x * this.rows + y] : null;
    }

    getRandomCell() {
        const x = Math.floor(Math.random() * this.columns);
        const y = Math.floor(Math.random() * this.rows);

        return this.getCell(x, y);
    }

    // ----- Placement -----

    placeWeapons() {
        WEAPON_TYPES.forEach(weapon => {
            let weaponPlaced = false;

            while (!weaponPlaced) {
                const cell = this.getRandomCell();

                if (cell.isEmpty) {
                    cell.content = weapon;
                    weaponPlaced = true;
                }
            }
        });
    }

    placeCharacters() {
        new PlayerManager().selectedPlayers.forEach(player => {
            const cell = this.findStartingCell();

            if (!cell) {
                return;
            }

            player.position = { x: cell.x, y: cell.y };
            cell.content = player;
            this.players.push(player);
        });
    }

    // Case vide, jamais adjacente à un joueur déjà placé.
    findStartingCell() {
        for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            const cell = this.getRandomCell();

            if (cell.isEmpty && !this.isAdjacentToPlayer(cell)) {
                return cell;
            }
        }

        return null;
    }

    isAdjacentToPlayer(cell) {
        return this.players.some(player =>
            Math.abs(player.x - cell.x) + Math.abs(player.y - cell.y) <= 1
        );
    }

    // ----- Rendu -----

    renderCell(cell) {
        const element = document.createElement("div");
        element.classList.add("map__cell");
        element.dataset.x = cell.x;
        element.dataset.y = cell.y;
        element.dataset.testid = `map-cell-${cell.x}-${cell.y}`;

        if (cell.isObstacle) {
            element.classList.add("map__cell--obstacle");
        }

        if (cell.content instanceof Player) {
            element.classList.add("map__cell--personnage");

            const image = document.createElement("img");
            image.classList.add("map__cell-sprite");
            image.src = cell.content.path;
            image.alt = cell.content.name;
            element.appendChild(image);
        }

        if (cell.content instanceof Weapon) {
            element.classList.add("map__cell--arme");
            element.appendChild(cell.content.render());
        }

        return element;
    }

    render(container) {
        container.innerHTML = "";

        container.style.display = "grid";
        container.style.gridTemplateColumns = `repeat(${this.columns}, minmax(0, 1fr))`;
        container.style.gridTemplateRows = `repeat(${this.rows}, minmax(0, 1fr))`;

        this.cells.forEach(cell => container.appendChild(this.renderCell(cell)));
    }
}

// La création de la carte est déclenchée par main.js, le rendu par renderGame (ui/render.js).