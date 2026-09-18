class Character {
    constructor(file) {
        this.file = file;
        this.name = file.replace(/\.png$/i, "");
        this.path = `characters/${file}`;
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
        if (!this.select) {
            console.error(`Selector not found: ${this.select}`);
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
            "Fabien.png",
            "Hamza.png",
            "Faical.png",
            "Abdel.png",
            "Samuel.png",
            "Nabil.png",
            "Philippe.png"
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

class Game {
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

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    game.start();
    displayPlayerNames();
});