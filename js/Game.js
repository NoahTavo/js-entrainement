class Game {
    constructor(map, players) {
        this.map = map;
        this.players = players;
        this.currentPlayerIndex = 0; // le joueur 1 commence toujours
        this.state = GAME_STATES.MOVING;
        this.movesLeft = MAX_MOVE;
        this.reachableCells = [];
        this.winner = null;
    }

    // ----- Accès -----

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getOpponent() {
        return this.players[(this.currentPlayerIndex + 1) % this.players.length];
    }

    // ----- Cycle de vie -----

    start() {
        addLog(`${this.getCurrentPlayer().getName()} commence la partie !`);
        this.computeReachableCells();
        renderGame(this);
    }

    // ----- Entrées clavier main.js -----

    handleKey(key) {
        if (this.state === GAME_STATES.OVER) {
            return;
        }

        if (this.state === GAME_STATES.COMBAT) {
            if (key === "a" || key === "A") {
                this.attack();
            }

            if (key === "p" || key === "P") {
                this.togglePosture();
            }

            return;
        }

        const direction = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right"
        }[key];

        if (direction) {
            this.moveByDirection(direction);
            return;
        }

        if (key === "Enter") {
            this.endTurn();
        }
    }

    // ----- Phase de déplacement (MOVING) -----

    moveByDirection(directionName) {
        if (this.state !== GAME_STATES.MOVING) {
            return;
        }

        const direction = DIRECTIONS[directionName];
        if (!direction) {
            return;
        }

        const player = this.getCurrentPlayer();
        const cell = this.map.getCell(player.x + direction.dx, player.y + direction.dy);

        if (!this.canMoveTo(cell)) {
            addLog("Déplacement impossible : case bloquée ou hors carte.");
            renderGame(this);
            return;
        }

        this.movePlayerTo(player, cell);
        this.movesLeft -= 1;
        this.afterMove();
    }

    // Déplacement au clic : suit le chemin complet trouvé par le parcours,
    // en ramassant les armes croisées en route.
    moveToCell(targetCell) {
        if (this.state !== GAME_STATES.MOVING) {
            return;
        }

        const target = this.reachableCells.find(entry => entry.cell === targetCell);
        if (!target) {
            return;
        }

        const player = this.getCurrentPlayer();

        for (const cell of target.path) {
            if (this.state !== GAME_STATES.MOVING) {
                break; // le combat s'est engagé en chemin : le trajet s'arrête
            }

            this.movePlayerTo(player, cell);
            this.movesLeft -= 1;

            if (this.arePlayersAdjacent()) {
                this.startCombat();
                break;
            }
        }

        if (this.state === GAME_STATES.MOVING && this.movesLeft <= 0) {
            this.endTurn();
            return;
        }

        if (this.state === GAME_STATES.MOVING) {
            this.computeReachableCells();
        }

        renderGame(this);
    }

    canMoveTo(cell) {
        return Boolean(cell) && !cell.isObstacle() && !(cell.content instanceof Player);
    }

    movePlayerTo(player, cell) {
        const previousCell = this.map.getCell(player.x, player.y);

        previousCell.clear();
        player.setPosition(cell.x, cell.y);
        this.pickUpWeapon(player, cell);
        cell.placeCharacter(player);
    }

    // Ramassage : le joueur échange son arme contre celle au sol.
    pickUpWeapon(player, cell) {
        if (!(cell.content instanceof Weapon)) {
            return;
        }

        const picked = cell.content;
        const dropped = player.getWeapon();

        player.setWeapon(picked);
        cell.placeWeapon(dropped);

        addLog(`${player.getName()} échange ${dropped.getName()} contre ${picked.getName()} (${picked.getDamage()} dégâts).`);
    }

    afterMove() {
        if (this.arePlayersAdjacent()) {
            this.startCombat();
            return;
        }

        if (this.movesLeft <= 0) {
            this.endTurn();
            return;
        }

        this.computeReachableCells();
        renderGame(this);
    }

    arePlayersAdjacent() {
        const first = this.players[0];
        const second = this.players[1];

        return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1;
    }

    endTurn() {
        if (this.state !== GAME_STATES.MOVING) {
            return;
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.movesLeft = MAX_MOVE;
        this.computeReachableCells();

        addLog(`Au tour de ${this.getCurrentPlayer().getName()}.`);
        renderGame(this);
    }

    // Cases atteignables ce tour : 1 à MAX_MOVE cases, à travers les cases
    // vides uniquement (obstacles et adversaire infranchissables).
    computeReachableCells() {
        const player = this.getCurrentPlayer();
        const startKey = `${player.x},${player.y}`;
        const distances = new Map([[startKey, 0]]);
        const parents = new Map();
        const queue = [{ x: player.x, y: player.y }];

        this.reachableCells = [];

        while (queue.length > 0) {
            const current = queue.shift();
            const currentKey = `${current.x},${current.y}`;
            const distance = distances.get(currentKey);

            if (distance >= this.movesLeft) {
                continue;
            }

            Object.values(DIRECTIONS).forEach(direction => {
                const x = current.x + direction.dx;
                const y = current.y + direction.dy;
                const key = `${x},${y}`;

                if (distances.has(key)) {
                    return;
                }

                const cell = this.map.getCell(x, y);
                if (!this.canMoveTo(cell)) {
                    return;
                }

                distances.set(key, distance + 1);
                parents.set(key, currentKey);
                this.reachableCells.push({
                    cell: cell,
                    path: this.buildPath(parents, key)
                });
                queue.push({ x: x, y: y });
            });
        }
    }

    // Reconstruit le chemin (cases) depuis la position de départ jusqu'à la case.
    buildPath(parents, key) {
        const path = [];
        let current = key;

        while (current) {
            const [x, y] = current.split(",").map(Number);
            path.unshift(this.map.getCell(x, y));
            current = parents.get(current) || null;
        }

        return path.slice(1); // sans la case de départ
    }

    // ----- Phase de combat (COMBAT) -----

    startCombat() {
        this.state = GAME_STATES.COMBAT;
        this.players.forEach(player => player.setPosture(POSTURES.OFFENSIVE));

        addLog(`${this.players[0].getName()} et ${this.players[1].getName()} sont adjacents : le combat s'engage !`);
        renderGame(this);
    }

    attack() {
        if (this.state !== GAME_STATES.COMBAT) {
            return;
        }

        const attacker = this.getCurrentPlayer();
        const defender = this.getOpponent();
        const weaponDamage = attacker.getWeapon().getDamage();

        // Posture défensive : le défenseur encaisse 50 % de dégâts en moins.
        const damage = defender.getPosture() === POSTURES.DEFENSIVE
            ? Math.floor(weaponDamage * DEFENSE_DAMAGE_MULTIPLIER)
            : weaponDamage;

        defender.takeDamage(damage);
        addLog(`${attacker.getName()} attaque ${defender.getName()} avec ${attacker.getWeapon().getName()} : ${damage} dégâts.`);

        if (!defender.isAlive()) {
            this.gameOver(attacker);
            return;
        }

        this.nextCombatTurn();
    }

    togglePosture() {
        if (this.state !== GAME_STATES.COMBAT) {
            return;
        }

        const player = this.getCurrentPlayer();
        player.togglePosture();

        addLog(`${player.getName()} adopte la posture ${POSTURE_LABELS[player.getPosture()].toLowerCase()}.`);
        this.nextCombatTurn();
    }

    nextCombatTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        addLog(`Au tour de ${this.getCurrentPlayer().getName()}.`);
        renderGame(this);
    }

    // ----- Fin de partie (OVER) -----

    gameOver(winner) {
        this.state = GAME_STATES.OVER;
        this.winner = winner;

        addLog(`${winner.getName()} remporte la partie !`);
        renderGame(this);
        showGameOver(winner);
    }
}