class Weapon {
    constructor(id, name, damage, icon) {
        this.id = id;
        this.name = name;
        this.damage = damage;
        this.icon = icon; // chemin vers le SVG de l'arme
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getDamage() {
        return this.damage;
    }


    // Permet à GameMap.js de savoir comment afficher une arme posée au sol,
    // sur le même principe que Character.getPath() / getName() dans Player.js
    render() {
        const image = document.createElement("img");
        image.classList.add("map__cell-sprite");
        image.src = this.icon;
        image.alt = this.name;
        return image;
    }
}

//------------------------------------------ARME------------------------------------------------------------------------
const WEAPON_TYPES = [
    new Weapon("sword", "Knife", 15, "assets/weapons/sword.svg"),
    new Weapon("gun", "Gun", 20, "assets/weapons/gun-military.svg"),
    new Weapon("rocket", "Rocket", 50, "assets/weapons/missile.svg"),
    new Weapon("kalashnikov", "Kalashnikov", 25, "assets/weapons/kalashnikov.svg"),
];
//----------------------------------------------------------------------------------------------------------------------
// L'arme de départ, équipée par les deux joueurs avant tout ramassage.
const DEFAULT_WEAPON = new Weapon("fists", "Poings", 5, "assets/weapons/poings.svg");