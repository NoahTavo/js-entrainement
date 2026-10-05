class Weapon {
    constructor(id, name, damage, icon) {
        this._id = id;
        this._name = name;
        this._damage = damage;
        this._icon = icon; // chemin vers le SVG de l'arme
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get damage() {
        return this._damage;
    }

    get icon() {
        return this._icon;
    }

    // Permet à GameMap.js de savoir comment afficher une arme posée au sol.
    render() {
        const image = document.createElement("img");
        image.classList.add("map__cell-sprite");
        image.src = this.icon;
        image.alt = this.name;
        return image;
    }
}
