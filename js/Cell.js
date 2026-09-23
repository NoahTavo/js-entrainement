class Cell {
    constructor(x, y, obstacleRate) {
        this._x = x;
        this._y = y;
        this._obstacleRate = obstacleRate;
        this._content = this.selectContent();
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get content() {
        return this._content;
    }

    set content(value) {
        this._content = value;
    }

    selectContent() {
        const random = Math.random();

        if (random < this._obstacleRate) {
            return "obstacle";
        }

        return "empty";
    }

    get isObstacle() {
        return this._content === "obstacle";
    }

    get isEmpty() {
        return this._content === "empty";
    }

    placeWeapon(weapon) {
        this._content = weapon;
    }

    placeCharacter(character) {
        this._content = character;
    }

    clear() {
        this._content = "empty";
    }

    render() {
        const element = document.createElement("div");
        element.classList.add("map__cell");
        element.dataset.x = this.x;
        element.dataset.y = this.y;
        element.dataset.testid = `map-cell-${this.x}-${this.y}`;

        if (this.isObstacle) {
            element.classList.add("map__cell--obstacle");
        }

        if (this.content instanceof Player) {
            element.classList.add("map__cell--personnage"); // aligné sur le CSS existant

            const image = document.createElement("img");
            image.classList.add("map__cell-sprite");
            image.src = this.content.getPath();
            image.alt = this.content.getName();

            element.appendChild(image);
        }

        if (this.content instanceof Weapon) {
            element.classList.add("map__cell--arme");
            element.appendChild(this.content.render());
        }

        return element;
    }
}