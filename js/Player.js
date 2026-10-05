class Character {
    constructor(file) {
        this.file = file;
        this.name = file.replace(/\.png$/i, "");
        this.path = `assets/characters/${file}`;
    }

    getFile() {
        return this.file;
    }

    getName() {
        return this.name;
    }

    getPath() {
        return this.path;
    }
}

class CharacterSelector {
    constructor(selectId, previewId, characters) {
        this.select = document.getElementById(selectId);
        this.preview = document.getElementById(previewId);
        this.characters = characters;
        this.initialize();
    }

    initialize() {
        // Absent sur les pages sans sélecteur de personnage (index.html).
        if (!this.select || !this.preview) {
            return;
        }
        this.populateSelector();
        this.addEventListeners();
    }

    populateSelector() {
        this.select.replaceChildren();

        this.characters.forEach(character => {
            const option = document.createElement("option");
            option.value = character.getFile();
            option.textContent = character.getName();
            this.select.appendChild(option);
        });
    }

    addEventListeners() {
        this.select.addEventListener("change", () => {
            this.selectCharacter();
        });
    }

    selectCharacter() {
        const file = this.select.value;
        if (!file) {
            this.preview.removeAttribute("src");
            this.preview.removeAttribute("alt");
            return;
        }
        const character = this.characters.find(character => character.getFile() === file);
        if (!character) {
            return;
        }
        this.preview.src = character.getPath();
        this.preview.alt = character.getName();
    }
}

class CharacterManager {
    constructor() {
        this.characters = [];
        this.loadCharacters();
        this.initializeSelectors();
    }

    loadCharacters() {
        const files = [
            "Jules.png",
            "Noah.png",
            "Wissem.png",
            "Charlie.png",
            "Hamza.png",
            "Faical.png",
            "Abdel.png",
            "Samuel.png"
        ];
        files.forEach(file => {
            this.characters.push(new Character(file));
        });
    }

    initializeSelectors() {
        new CharacterSelector("player1", "player1-preview", this.characters);
        new CharacterSelector("player2", "player2-preview", this.characters);
    }

    getCharacters() {
        return this.characters;
    }

    getCharacter(file) {
        return this.characters.find(character => {
            return character.getFile() === file;
        });
    }
}

class FatalityMenu {
    constructor() {
        this.characterManager = new CharacterManager();
    }

    start() {
        console.log("Dynedoc Fatality start.");
        console.log(`${this.characterManager.getCharacters().length} characters available.`);
    }
}

const PLAYER1_STORAGE_KEY = "Dynedoc_player1";
const PLAYER2_STORAGE_KEY = "Dynedoc_player2";

function retrieveSelectedCharacters() {
    const characterManager = new CharacterManager();
    const files = [
        localStorage.getItem(PLAYER1_STORAGE_KEY),
        localStorage.getItem(PLAYER2_STORAGE_KEY)
    ];

    return files.map(file => {
        return characterManager.getCharacter(file);
    }).filter(character => character);
}

function displayPlayerNames() {
    const characterManager = new CharacterManager();
    const players = [
        {
            file: localStorage.getItem(PLAYER1_STORAGE_KEY),
            selector: ".player-card--p1 .player-card__name"
        },
        {
            file: localStorage.getItem(PLAYER2_STORAGE_KEY),
            selector: ".player-card--p2 .player-card__name"
        }
    ];

    players.forEach(player => {
        const nameElement = document.querySelector(player.selector);
        const character = characterManager.getCharacter(player.file);

        if (nameElement && character) {
            nameElement.textContent = character.getName();
        }
    });
}

function startGame() {
    const select1 = document.getElementById("player1");
    const select2 = document.getElementById("player2");

    if (!select1 || !select2) {
        console.error("Character selectors not found.");
        return;
    }

    const file1 = select1.value;
    const file2 = select2.value;

    if (!file1 || !file2) {
        alert("Choose a character for each player before starting the game.");
        return;
    }

    localStorage.setItem(PLAYER1_STORAGE_KEY, file1);
    localStorage.setItem(PLAYER2_STORAGE_KEY, file2);

    window.location.href = "index.html";
}

// ---------------------------------------------------------------------------
// Player : position, PV, arme, posture.
// ---------------------------------------------------------------------------
class Player {
    constructor(character, x, y) {
        this.character = character; // feuille de personnage (nom + icon)
        this.x = x;
        this.y = y;
        this.hp = PLAYER_MAX_HP;
        this.weapon = DEFAULT_WEAPON; // Poings, avant tout ramassage
        this.posture = POSTURES.OFFENSIVE;
    }

    getName() {
        return this.character.getName();
    }

    getPath() {
        return this.character.getPath();
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getHp() {
        return this.hp;
    }

    takeDamage(damage) {
        this.hp = Math.max(0, this.hp - damage);
    }

    isAlive() {
        return this.hp > 0;
    }

    getWeapon() {
        return this.weapon;
    }

    setWeapon(weapon) {
        this.weapon = weapon;
    }

    getPosture() {
        return this.posture;
    }

    setPosture(posture) {
        this.posture = posture;
    }

    // Posture défensive : -50 % de dégâts subis au prochain tour.
    togglePosture() {
        this.posture = this.posture === POSTURES.OFFENSIVE
            ? POSTURES.DEFENSIVE
            : POSTURES.OFFENSIVE;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new FatalityMenu();
    game.start();
    displayPlayerNames();
});