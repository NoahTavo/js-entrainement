class Game {
    // Touches du clavier -> nom de direction (voir DIRECTIONS dans config/constants.js)
    static KEY_DIRECTIONS = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
    };

    // Clé unique d'une coordonnée, utilisée par le parcours des cases atteignables
    static toKey = (x, y) => `${x},${y}`;

    constructor(map, players) {
        this._map = map;
        this._players = players;
        this._currentPlayerIndex = 0; // le joueur 1 commence toujours
        this._state = GAME_STATES.MOVING;
        this._movesLeft = MAX_MOVE;
        this._reachableCells = [];
        this._winner = null;
    }

    // ==================================================================
    // Getters / setters
    // ==================================================================

    get map() {
        return this._map;
    }

    get players() {
        return this._players;
    }

    get currentPlayerIndex() {
        return this._currentPlayerIndex;
    }

    set currentPlayerIndex(value) {
        this._currentPlayerIndex = value;
    }

    get state() {
        return this._state;
    }

    set state(value) {
        this._state = value;
    }

    get movesLeft() {
        return this._movesLeft;
    }

    set movesLeft(value) {
        this._movesLeft = value;
    }

    get reachableCells() {
        return this._reachableCells;
    }

    set reachableCells(value) {
        this._reachableCells = value;
    }

    get winner() {
        return this._winner;
    }

    set winner(value) {
        this._winner = value;
    }

    get currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    get opponent() {
        return this.players[(this.currentPlayerIndex + 1) % this.players.length];
    }

    get isMoving() {
        return this.state === GAME_STATES.MOVING;
    }

    get isInCombat() {
        return this.state === GAME_STATES.COMBAT;
    }

    get isOver() {
        return this.state === GAME_STATES.OVER;
    }

    get arePlayersAdjacent() {
        const [first, second] = this.players;

        return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1;
    }

    switchToNextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    announceCurrentTurn() {
        addLog(`Au tour de ${this.currentPlayer.name}.`);
    }

    // ==================================================================
    // Cycle de vie
    // ==================================================================

    start() {
        addLog(`${this.currentPlayer.name} commence la partie !`);
        this.computeReachableCells();
        renderGame(this);
    }

    // ==================================================================
    // Entrées clavier (appelées depuis main.js)
    // ==================================================================

    handleKey(key) {
        if (this.isOver) {
            return;
        }

        if (this.isInCombat) {
            this.handleCombatKey(key);
            return;
        }

        this.handleMovingKey(key);
    }

    handleCombatKey(key) {
        const lowerKey = key.toLowerCase();

        if (lowerKey === "a") {
            this.attack();
        }

        if (lowerKey === "p") {
            this.togglePosture();
        }
    }

    handleMovingKey(key) {
        const directionName = Game.KEY_DIRECTIONS[key];

        if (directionName) {
            this.moveByDirection(directionName);
            return;
        }

        if (key === "Enter") {
            this.endTurn();
        }
    }

    // ==================================================================
    // Phase de déplacement (MOVING)
    // ==================================================================

    // Déplacement d'une case au clavier.
    moveByDirection(directionName) {
        if (!this.isMoving) {
            return;
        }

        const direction = DIRECTIONS[directionName];
        if (!direction) {
            return;
        }

        const player = this.currentPlayer;
        const cell = this.map.getCell(player.x + direction.dx, player.y + direction.dy);

        if (!this.canMoveTo(cell)) {
            this.rejectMove();
            return;
        }

        this.stepTo(player, cell);
        this.afterMove();
    }

    // Déplacement au clic : le joueur suit le chemin complet jusqu'à la case ciblée.
    moveToCell(targetCell) {
        if (!this.isMoving) {
            return;
        }

        const target = this.findReachableEntry(targetCell);
        if (!target) {
            return;
        }

        this.followPath(target.path);

        // Si le combat s'est engagé en chemin, il gère déjà l'affichage.
        if (this.isMoving) {
            this.continueTurn();
        }
    }

    findReachableEntry(cell) {
        return this.reachableCells.find(entry => entry.cell === cell);
    }

    // Avance case par case ; s'arrête dès que le combat s'engage.
    followPath(path) {
        const player = this.currentPlayer;

        for (const cell of path) {
            this.stepTo(player, cell);

            if (this.arePlayersAdjacent) {
                this.startCombat();
                return;
            }
        }
    }

    rejectMove() {
        addLog("Déplacement impossible : case bloquée ou hors carte.");
        renderGame(this);
    }

    canMoveTo(cell) {
        return Boolean(cell) && !cell.isObstacle && !(cell.content instanceof Player);
    }

    // Un pas : déplace le joueur et consomme un point de déplacement.
    stepTo(player, cell) {
        this.movePlayerTo(player, cell);
        this.movesLeft -= 1;
    }

    movePlayerTo(player, cell) {
        const previousCell = this.map.getCell(player.x, player.y);

        previousCell.content = Cell.EMPTY;
        player.position = { x: cell.x, y: cell.y };
        this.pickUpWeapon(player, cell);
        cell.content = player;
    }

    // Ramassage : le joueur échange son arme contre celle au sol.
    pickUpWeapon(player, cell) {
        if (!(cell.content instanceof Weapon)) {
            return;
        }

        const picked = cell.content;
        const dropped = player.weapon;

        player.weapon = picked;
        cell.content = dropped;

        addLog(`${player.name} échange ${dropped.name} contre ${picked.name} (${picked.damage} dégâts).`);
    }

    // Après un pas au clavier : combat, fin de tour, ou on continue.
    afterMove() {
        if (this.arePlayersAdjacent) {
            this.startCombat();
            return;
        }

        this.continueTurn();
    }

    // Fin de tour si plus de déplacements, sinon recalcul des cases accessibles.
    continueTurn() {
        if (this.movesLeft <= 0) {
            this.endTurn();
            return;
        }

        this.computeReachableCells();
        renderGame(this);
    }

    endTurn() {
        if (!this.isMoving) {
            return;
        }

        this.switchToNextPlayer();
        this.movesLeft = MAX_MOVE;
        this.computeReachableCells();

        this.announceCurrentTurn();
        renderGame(this);
    }

    // ==================================================================
    // Cases atteignables (parcours en largeur)
    // ==================================================================

    // Cases atteignables ce tour : 1 à movesLeft cases, à travers les cases
    // vides uniquement (obstacles et adversaire infranchissables).
    computeReachableCells() {
        const player = this.currentPlayer;
        const search = {
            distances: new Map([[Game.toKey(player.x, player.y), 0]]),
            parents: new Map(),
            queue: [{ x: player.x, y: player.y }]
        };

        this.reachableCells = [];

        while (search.queue.length > 0) {
            this.exploreNext(search);
        }
    }

    // Traite la prochaine case de la file et visite ses voisines.
    exploreNext(search) {
        const current = search.queue.shift();
        const distance = search.distances.get(Game.toKey(current.x, current.y));

        if (distance >= this.movesLeft) {
            return;
        }

        Object.values(DIRECTIONS).forEach(direction => {
            this.visitNeighbor(search, current, direction, distance);
        });
    }

    visitNeighbor(search, current, direction, distance) {
        const x = current.x + direction.dx;
        const y = current.y + direction.dy;
        const key = Game.toKey(x, y);
        const cell = this.map.getCell(x, y);

        if (search.distances.has(key) || !this.canMoveTo(cell)) {
            return;
        }

        search.distances.set(key, distance + 1);
        search.parents.set(key, Game.toKey(current.x, current.y));
        search.queue.push({ x, y });

        this.reachableCells.push({
            cell,
            path: this.buildPath(search.parents, key)
        });
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

    // ==================================================================
    // Phase de combat (COMBAT)
    // ==================================================================

    startCombat() {
        this.state = GAME_STATES.COMBAT;
        this.players.forEach(player => {
            player.posture = POSTURES.OFFENSIVE;
        });

        addLog(`${this.players[0].name} et ${this.players[1].name} sont adjacents : le combat s'engage !`);
        renderGame(this);
    }

    attack() {
        if (!this.isInCombat) {
            return;
        }

        const attacker = this.currentPlayer;
        const defender = this.opponent;
        const damage = this.computeDamage(attacker, defender);

        defender.takeDamage(damage);
        addLog(`${attacker.name} attaque ${defender.name} avec ${attacker.weapon.name} : ${damage} dégâts.`);

        if (!defender.isAlive) {
            this.gameOver(attacker);
            return;
        }

        this.nextCombatTurn();
    }

    // Posture défensive : le défenseur encaisse moins de dégâts.
    computeDamage(attacker, defender) {
        const weaponDamage = attacker.weapon.damage;

        if (defender.posture === POSTURES.DEFENSIVE) {
            return Math.floor(weaponDamage * DEFENSE_DAMAGE_MULTIPLIER);
        }

        return weaponDamage;
    }

    togglePosture() {
        if (!this.isInCombat) {
            return;
        }

        const player = this.currentPlayer;
        player.togglePosture();

        addLog(`${player.name} adopte la posture ${POSTURE_LABELS[player.posture].toLowerCase()}.`);
        this.nextCombatTurn();
    }

    nextCombatTurn() {
        this.switchToNextPlayer();
        this.announceCurrentTurn();
        renderGame(this);
    }

    // ==================================================================
    // Fin de partie (OVER)
    // ==================================================================

    gameOver(winner) {
        this.state = GAME_STATES.OVER;
        this.winner = winner;

        addLog(`${winner.name} remporte la partie !`);
        renderGame(this);
        showGameOver(winner);
    }
}
