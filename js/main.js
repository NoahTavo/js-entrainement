document.addEventListener("DOMContentLoaded", () => {
    ensureCharactersSelected();

    const map = new GameMap(GRID_COLUMNS, GRID_ROWS, OBSTACLE_RATE, MAX_WEAPONS);
    const game = new Game(map, map.players);
    window.game = game; // pratique pour le débogage dans la console

    game.start();

    // Clavier : flèches pour se déplacer, A pour attaquer, P pour la posture,
    // Entrée pour terminer le tour.
    document.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
        }

        game.handleKey(event.key);
    });

    // Boutons d'action (mêmes actions que les touches).
    const attackButton = document.getElementById("attack-button");
    const postureButton = document.getElementById("posture-button");
    const endTurnButton = document.getElementById("end-turn-button");

    attackButton.addEventListener("click", () => game.attack());
    postureButton.addEventListener("click", () => game.togglePosture());
    endTurnButton.addEventListener("click", () => game.endTurn());

    // Clic sur une case surlignée pour s'y déplacer.
    getMapContainer().addEventListener("click", (event) => {
        const cellElement = event.target.closest(".map__cell");
        if (!cellElement) {
            return;
        }

        const x = Number(cellElement.dataset.x);
        const y = Number(cellElement.dataset.y);
        game.moveToCell(game.map.getCell(x, y));
    });
});

// index.html ouvert sans passage par le menu : pose une sélection par défaut.
function ensureCharactersSelected() {
    const characters = retrieveSelectedCharacters();

    if (characters.length < 2) {
        const characterManager = new CharacterManager();
        const available = characterManager.getCharacters();

        localStorage.setItem(PLAYER1_STORAGE_KEY, available[0].getFile());
        localStorage.setItem(PLAYER2_STORAGE_KEY, available[1].getFile());
    }
}
