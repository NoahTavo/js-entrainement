class GameMap {
    constructor(containerId, size, obstacleRate)
    {
        this.container = document.getElementById('map');
        this.size = size;
        this.obstacleRate = obstacleRate;
        this.grid = [];

        this.generateGrid();
        this.render();
    }

    // Crée le tableau 2D avec des obstacles placés au hasard
    generateGrid() {
        for (let y = 0; y < this.size; y++) {
            const row = [];
            for (let x = 0; x < this.size; x++) {
                const isObstacle = Math.random() < this.obstacleRate;
                row.push(isObstacle ? 1 : 0);
            }
            this.grid.push(row);
        }
    }

    // Affiche la grille dans le DOM à partir de this.grid
    render() {
        this.container.innerHTML = '';
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('map__cell');

                if (this.grid[y][x] === 1) {
                    cell.classList.add('map__cell--obstacle');
                }

                this.container.appendChild(cell);
            }
        }
    }
}

//Génération automatique de la carte au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new GameMap('map', 16, 0.15);
});