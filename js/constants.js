// ----- Carte -----
const GRID_COLUMNS = 10;
const GRID_ROWS = 10;
const OBSTACLE_RATE = 0.15;      // 15 % de cases inaccessibles
const MAX_WEAPONS = 4;           // nombre maximum d'armes posées sur la carte
const MAX_GENERATION_ATTEMPTS = 100; // sécurité si les joueurs sont emmurés

// ----- Joueurs -----
const PLAYER_MAX_HP = 100;
const MAX_MOVE = 3;                    // cases par tour
const DEFAULT_WEAPON_DAMAGE = 10;      // arme de départ (poings)
const DEFENSE_DAMAGE_MULTIPLIER = 0.5; // posture défensive : -50 % de dégâts

const POSTURES = {
    OFFENSIVE: "offensive",
    DEFENSIVE: "defensive"
};

const POSTURE_LABELS = {
    [POSTURES.OFFENSIVE]: "Offensive",
    [POSTURES.DEFENSIVE]: "Défensive"
};

// ----- États de la partie -----
const GAME_STATES = {
    MOVING: "moving",   // phase de déplacement
    COMBAT: "combat",   // les deux joueurs sont adjacents
    OVER: "over"        // un joueur est tombé à 0 PV
};

// ----- Directions (flèches du clavier) -----
const DIRECTIONS = {
    up:    { dx: 0,  dy: -1 },
    down:  { dx: 0,  dy: 1 },
    left:  { dx: -1, dy: 0 },
    right: { dx: 1,  dy: 0 }
};