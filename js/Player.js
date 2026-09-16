class Personnage {
    constructor(fichier) {
        this.fichier = fichier;
        this.nom = fichier.replace(/\.svg$/i, "");
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
            "jules.svg",
            "noah.svg",
            "wissem.svg",
            "charly.svg",
            "fabien.svg",
            "hamza.svg",
            "faical.svg",
            "abdel.svg",
            "samuel.svg",
            "nabil.svg",
            "philippe.svg"
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

document.addEventListener("DOMContentLoaded", () => {
    const jeu = new Jeu();
    jeu.demarrer();
});