class GameMap {
    constructor(columns, rows, obstacleRate, numberWeapons) {
        this.columns = columns;
        this.rows = rows;
        this.obstacleRate = obstacleRate;
        this.numberWeapons = numberWeapons;

        this.cells = [];

        this.createCells();
        this.placeWeapons();
        this.placeCharacters();
    }

    // Ex-Cell.selectContent : la carte connaît la proportion d'obstacles
    selectContent() {
        return Math.random() < this.obstacleRate ? "obstacle" : "empty";
    }

    createCells() {
        for (let x = 0; x < this.columns; x++) {
            for (let y = 0; y < this.rows; y++) {
                this.cells.push(new Cell(x, y, this.selectContent()));
            }
        }
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

        return this.cells[x * this.rows + y];
    }

    // Méthode factorisée : tire une case au hasard sur la carte
    getRandomCell() {
        const x = Math.floor(Math.random() * this.columns);
        const y = Math.floor(Math.random() * this.rows);

        return this.getCell(x, y);
    }

    placeWeapons() {
        WEAPON_TYPES.forEach(weaponType => {
            let weaponPlaced = false;

            while (!weaponPlaced) {
                const cell = this.getRandomCell();

                if (cell.isEmpty) {
                    cell.content = weaponType;
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

                const cell = this.getRandomCell();

                // Cases vides uniquement, et jamais adjacentes à un joueur :
                // les deux joueurs ne démarrent pas côte à côte.
                if (!cell.isEmpty || this.isAdjacentToPlayer(cell, placedPlayers)) {
                    continue;
                }

                const player = new Player(character, cell.x, cell.y);
                cell.content = player;
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
        return this.cells
            .filter(cell => cell.content instanceof Player)
            .map(cell => cell.content);
    }

    // Ex-Cell.render : le rendu d'une case est géré par la carte
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
            image.src = cell.content.getPath();
            image.alt = cell.content.getName();
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
        container.style.gridTemplateColumns =
            `repeat(${this.columns}, minmax(0, 1fr))`;
        container.style.gridTemplateRows =
            `repeat(${this.rows}, minmax(0, 1fr))`;

        this.cells.forEach(cell => {
            container.appendChild(this.renderCell(cell));
        });
    }
}

// La création de la carte est déclenchée par main.js, le rendu par renderGame.