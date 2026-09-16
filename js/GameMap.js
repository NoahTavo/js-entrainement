class Cell {
    constructor(obstacleRate) {
        this.obstacleRate = obstacleRate;
        this.contenu = this.choisirContenu();
    }

    choisirContenu() {
        const aleatoire = Math.random();

        if (aleatoire < this.obstacleRate) {
            return "obstacle";
        }

        return "vide";
    }

    estObstacle() {
        return this.contenu === "obstacle";
    }

    estVide() {
        return this.contenu === "vide";
    }

    placerArme(arme) {
        this.contenu = arme;
    }

    placerPersonnage(personnage) {
        this.contenu = personnage;
    }

    render() {
        const element = document.createElement("div");

        element.classList.add("map__cell");

        if (this.estObstacle()) {
            element.classList.add("map__cell--obstacle");
        }

        if (this.contenu instanceof Personnage) {
            element.classList.add("map__cell--personnage");

            const image = document.createElement("img");
            image.classList.add("map__cell-sprite");
            image.src = this.contenu.getChemin();
            image.alt = this.contenu.getNom();

            element.appendChild(image);
        }

        return element;
    }
}


class Column {
    constructor(taille, obstacleRate) {
        this.taille = taille;
        this.obstacleRate = obstacleRate;
        this.cellules = [];

        this.creerCellules();
    }

    creerCellules() {
        for (let i = 0; i < this.taille; i++) {
            const cellule = new Cell(this.obstacleRate);
            this.cellules.push(cellule);
        }
    }

    getCellule(index) {
        return this.cellules[index];
    }

    getCellules() {
        return this.cellules;
    }

    render(container) {
        this.cellules.forEach(cellule => {
            container.appendChild(cellule.render());
        });
    }
}


class Map {
    constructor(containerId, taille, obstacleRate, nombreArmes) {
        this.container = document.getElementById(containerId);
        this.taille = taille;
        this.obstacleRate = obstacleRate;
        this.nombreArmes = nombreArmes;

        this.colonnes = [];

        this.creerColonnes();
        this.placerArmes();
        this.placerPersonnages();
        this.render();
    }

    creerColonnes() {
        for (let i = 0; i < this.taille; i++) {
            const colonne = new Column(
                this.taille,
                this.obstacleRate
            );

            this.colonnes.push(colonne);
        }
    }

    placerArmes() {
        let armesPlacees = 0;

        while (armesPlacees < this.nombreArmes) {
            const x = Math.floor(Math.random() * this.taille);
            const y = Math.floor(Math.random() * this.taille);

            const cellule = this.colonnes[x].getCellule(y);

            if (cellule.estVide()) {
                // Pour l'instant on réserve simplement
                // l'emplacement de l'arme.
                cellule.placerArme("arme");

                armesPlacees++;
            }
        }
    }

    placerPersonnages() {
        const personnages = recupererPersonnagesSelectionnes();

        personnages.forEach(personnage => {
            let personnagePlace = false;

            while (!personnagePlace) {
                const x = Math.floor(Math.random() * this.taille);
                const y = Math.floor(Math.random() * this.taille);
                const cellule = this.getCellule(x, y);

                if (cellule.estVide()) {
                    cellule.placerPersonnage(personnage);
                    personnagePlace = true;
                }
            }
        });
    }

    getCellule(x, y) {
        if (
            x < 0 ||
            x >= this.taille ||
            y < 0 ||
            y >= this.taille
        ) {
            return null;
        }

        return this.colonnes[x].getCellule(y);
    }

    render() {
        this.container.innerHTML = "";

        this.container.style.display = "grid";
        this.container.style.gridTemplateColumns =
            `repeat(${this.taille}, minmax(0, 1fr))`;
        this.container.style.gridTemplateRows =
            `repeat(${this.taille}, minmax(0, 1fr))`;

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