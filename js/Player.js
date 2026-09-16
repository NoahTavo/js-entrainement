class Personnage {
    constructor(fichier) {
        this.fichier = fichier;
        this.nom = fichier.replace(/\.png$/i, "");
        this.chemin = `personnages/${fichier}`;
    }

    getFichier() {
        return this.fichier;
    }

    getNom() {
        return this.nom;
    }

    getChemin() {
        return this.chemin;
    }
}

class SelecteurPersonnage {
    constructor(selectId, previewId, personnages) {
        this.select = document.getElementById(selectId);
        this.preview = document.getElementById(previewId);
        this.personnages = personnages;
        this.initialiser();
    }

    initialiser() {
        if (!this.select) {
            console.error(`Sélecteur introuvable : ${this.select}`);
            return;
        }
        this.remplirSelecteur();
        this.ajouterEvenement();
    }

    remplirSelecteur() {
        this.select.replaceChildren();

        this.personnages.forEach(personnage => {
            const option = document.createElement("option");
            option.value = personnage.getFichier();
            option.textContent = personnage.getNom();
            this.select.appendChild(option);
        });
    }

    ajouterEvenement() {
        this.select.addEventListener("change", () => {
            this.selectionnerPersonnage();
        });
    }

    selectionnerPersonnage() {
        const fichier = this.select.value;
        if (!fichier) {
            this.preview.removeAttribute("src");
            this.preview.removeAttribute("alt");
            return;
        }
        const personnage = this.personnages.find(personnage => personnage.getFichier() === fichier);
        if (!personnage) {
            return;
        }
        this.preview.src = personnage.getChemin();
        this.preview.alt = personnage.getNom();
    }
}

class GestionnairePersonnages {
    constructor() {
        this.personnages = [];
        this.chargerPersonnages();
        this.initialiserSelecteurs();
    }

    chargerPersonnages() {
        const fichiers = [
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
        fichiers.forEach(fichier => {
            this.personnages.push(new Personnage(fichier));
        });
    }

    initialiserSelecteurs() {
        new SelecteurPersonnage("player1", "player1-preview", this.personnages);
        new SelecteurPersonnage("player2", "player2-preview", this.personnages);
    }

    getPersonnages() {
        return this.personnages;
    }

    getPersonnage(fichier) {
        return this.personnages.find(personnage => {
            return personnage.getFichier() === fichier;
        });
    }
}

class Jeu {
    constructor() {
        this.gestionnairePersonnages = new GestionnairePersonnages();
    }

    demarrer() {
        console.log("Dynedoc Fatality démarré.");
        console.log(`${this.gestionnairePersonnages.getPersonnages().length} personnages disponibles.`);
    }
}

const CLE_STOCKAGE_JOUEUR1 = "Dynedoc_joueur1";
const CLE_STOCKAGE_JOUEUR2 = "Dynedoc_joueur2";

function recupererPersonnagesSelectionnes() {
    const gestionnaire = new GestionnairePersonnages();
    const fichiers = [
        localStorage.getItem(CLE_STOCKAGE_JOUEUR1),
        localStorage.getItem(CLE_STOCKAGE_JOUEUR2)
    ];

    return fichiers.map(fichier => {
        return gestionnaire.getPersonnage(fichier);
    }).filter(personnage => personnage);
}

function afficherNomsJoueurs() {
    const gestionnaire = new GestionnairePersonnages();
    const joueurs = [
        {
            fichier: localStorage.getItem(CLE_STOCKAGE_JOUEUR1),
            selecteur: ".player-card--p1 .player-card__name"
        },
        {
            fichier: localStorage.getItem(CLE_STOCKAGE_JOUEUR2),
            selecteur: ".player-card--p2 .player-card__name"
        }
    ];

    joueurs.forEach(joueur => {
        const elementNom = document.querySelector(joueur.selecteur);
        const personnage = gestionnaire.getPersonnage(joueur.fichier);

        if (elementNom && personnage) {
            elementNom.textContent = personnage.getNom();
        }
    });
}

function demarrerPartie() {
    const select1 = document.getElementById("player1");
    const select2 = document.getElementById("player2");

    if (!select1 || !select2) {
        console.error("Sélecteurs de personnages introuvables.");
        return;
    }

    const fichier1 = select1.value;
    const fichier2 = select2.value;

    if (!fichier1 || !fichier2) {
        alert("Choisissez un personnage pour chaque joueur avant de lancer la partie.");
        return;
    }

    localStorage.setItem(CLE_STOCKAGE_JOUEUR1, fichier1);
    localStorage.setItem(CLE_STOCKAGE_JOUEUR2, fichier2);

    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const jeu = new Jeu();
    jeu.demarrer();
    afficherNomsJoueurs();
});