class Cell {
    constructor(obstacleRate) {
        this.obstacleRate = obstacleRate;
        this.contenu = this.Selectcontent();
    }

    Selectcontent() {
        const aleatoire = Math.random();

        if (aleatoire < this.obstacleRate) {
            return "obstacle";
        }

        return "void";
    }

    isObstacle() {
        return this.contenu === "obstacle";
    }

    isVoid() {
        return this.contenu === "void";
    }

    placeWeapon(arme) {
        this.contenu = arme;
    }

    placeCharacter(personnage) {
        this.contenu = personnage;
    }

    render() {
        const element = document.createElement("div");

        element.classList.add("map__cell");

        if (this.isObstacle()) {
            element.classList.add("map__cell--obstacle");
        }

        if (this.contenu instanceof Personnage) {
            element.classList.add("map__cell--personnage");

            const image = document.createElement("img");
            image.classList.add("map__cell-sprite");
            image.src = this.contenu.getpath();
            image.alt = this.contenu.getname();

            element.appendChild(image);
        }

        return element;
    }
}


class Column {
    constructor(size, obstacleRate) {
        this.size = size;
        this.obstacleRate = obstacleRate;
        this.cellules = [];

        this.createCells();
    }

    createCells() {
        for (let i = 0; i < this.size; i++) {
            const cellule = new Cell(this.obstacleRate);
            this.cellules.push(cellule);
        }
    }

    getCellule(index) {
        return this.cellules[index];
    }



    render(container) {
        this.cellules.forEach(cellule => {
            container.appendChild(cellule.render());
        });
    }
}


class Map {
    constructor(containerId, size, obstacleRate, numberWeapons) {
        this.container = document.getElementById(containerId);
        this.size = size;
        this.obstacleRate = obstacleRate;
        this.numberWeapons = numberWeapons;

        this.colonnes = [];

        this.creerColonnes();
        this.placeWeapons();
        this.placeCharacters();
        this.render();
    }

    creerColonnes() {
        for (let i = 0; i < this.size; i++) {
            const colonne = new Column(
                this.size,
                this.obstacleRate
            );

            this.colonnes.push(colonne);
        }
    }

    placeWeapons() {
        let weapPlacees = 0;

        while (weapPlacees < this.numberWeapons) {
            const x = Math.floor(Math.random() * this.size);
            const y = Math.floor(Math.random() * this.size);

            const cellule = this.colonnes[x].getCellule(y);

            if (cellule.isVoid()) {
                // Pour l'instant, on réserve simplement
                // l'emplacement de l'arme.
                cellule.placeWeapon("arme");

                weapPlacees++;
            }
        }
    }

    placeCharacters() {
        const characters = retrieveSelectedCharacters();

        characters.forEach(characters => {
            let charactersPlace = false;

            while (!charactersPlace) {
                const x = Math.floor(Math.random() * this.size);
                const y = Math.floor(Math.random() * this.size);
                const cellule = this.getCellule(x, y);

                if (cellule.isVoid()) {
                    cellule.placeCharacter(characters);
                    charactersPlace = true;
                }
            }
        });
    }

    getCellule(x, y) {
        if (
            x < 0 ||
            x >= this.size ||
            y < 0 ||
            y >= this.size
        ) {
            return null;
        }

        return this.colonnes[x].getCellule(y);
    }

    render() {
        this.container.innerHTML = "";

        this.container.style.display = "grid";
        this.container.style.gridTemplateColumns =
            `repeat(${this.size}, minmax(0, 1fr))`;
        this.container.style.gridTemplateRows =
            `repeat(${this.size}, minmax(0, 1fr))`;

        this.colonnes.forEach(colonne => {
            colonne.render(this.container);
        });
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const map = new Map(
        "map",
        10,
        0.15,
        4
    );
});