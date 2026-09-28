function getMapContainer() {
    return document.getElementById("map");
}

function findCellElement(x, y) {
    return document.querySelector(`.map__cell[data-x="${x}"][data-y="${y}"]`);
}

function renderGame(game) {
    game.map.render(getMapContainer());
    highlightReachableCells(game);
    highlightActivePlayerCell(game);
    updatePlayerCards(game);
    updateTurnIndicator(game);
    updateCombatActions(game);
}

// Surligne les cases où le joueur actif peut se déplacer ce tour.
function highlightReachableCells(game) {
    document.querySelectorAll(".map__cell--movable")
        .forEach(element => element.classList.remove("map__cell--movable"));

    if (game.state !== GAME_STATES.MOVING) {
        return;
    }

    game.reachableCells.forEach(entry => {
        const element = findCellElement(entry.cell.x, entry.cell.y);
        if (element) {
            element.classList.add("map__cell--movable");
        }
    });
}

function highlightActivePlayerCell(game) {
    document.querySelectorAll(".map__cell--active")
        .forEach(element => element.classList.remove("map__cell--active"));

    if (game.state === GAME_STATES.OVER) {
        return;
    }

    const player = game.getCurrentPlayer();
    const element = findCellElement(player.x, player.y);
    if (element) {
        element.classList.add("map__cell--active");
    }
}

// Fiches des joueurs : PV, arme, posture, encadré du joueur actif.
function updatePlayerCards(game) {
    game.players.forEach((player, index) => {
        const card = document.getElementById(`card-p${index + 1}`);
        if (!card) {
            return;
        }

        card.querySelector(".hp-value").textContent = player.getHp();
        card.querySelector(".player-card__hp-fill").style.width =
            `${(player.getHp() / PLAYER_MAX_HP) * 100}%`;
        card.querySelector(".weapon-value").textContent = player.getWeapon().getName();
        card.querySelector(".posture-value").textContent = POSTURE_LABELS[player.getPosture()];

        card.classList.toggle(
            "player-card--active",
            game.state !== GAME_STATES.OVER && game.getCurrentPlayer() === player
        );
    });
}

function updateTurnIndicator(game) {
    const indicator = document.getElementById("turn-indicator");
    if (!indicator) {
        return;
    }

    if (game.state === GAME_STATES.OVER) {
        indicator.textContent = `Partie terminée : ${game.winner.getName()} a gagné !`;
        return;
    }

    if (game.state === GAME_STATES.COMBAT) {
        indicator.textContent = `Combat ! ${game.getCurrentPlayer().getName()} joue.`;
        return;
    }

    indicator.textContent =
        `Tour de ${game.getCurrentPlayer().getName()} — ${game.movesLeft} déplacement(s) restant(s)`;
}

function updateCombatActions(game) {
    const attackButton = document.getElementById("attack-button");
    const postureButton = document.getElementById("posture-button");
    const endTurnButton = document.getElementById("end-turn-button");
    if (!attackButton || !postureButton || !endTurnButton) {
        return;
    }

    const inCombat = game.state === GAME_STATES.COMBAT;
    attackButton.disabled = !inCombat;
    postureButton.disabled = !inCombat;
    endTurnButton.disabled = inCombat || game.state === GAME_STATES.OVER;
}

// Journal de combat / de déplacement.
function addLog(message) {
    const log = document.getElementById("log");
    if (!log) {
        return;
    }

    const entry = document.createElement("p");
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Message de victoire.
function showGameOver(winner) {
    const overlay = document.getElementById("game-over");
    const title = document.getElementById("game-over-title");
    if (!overlay || !title) {
        return;
    }

    title.textContent = `${winner.getName()} A GAGNÉ !`;
    overlay.classList.remove("hidden");
}
