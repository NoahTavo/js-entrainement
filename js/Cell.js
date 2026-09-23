class Cell {
    constructor(x, y, obstacleRate) {
        this.x = x;
        this.y = y;
        this.obstacleRate = obstacleRate;
        this.content = this.selectContent();
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    selectContent() {
        const random = Math.random();

        if (random < this.obstacleRate) {
            return "obstacle";
        }

        return "empty";
    }

    isObstacle() {
        return this.content === "obstacle";
    }

    isEmpty() {
        return this.content === "empty";
    }

    placeWeapon(weapon) {
        this.content = weapon;
    }

    placeCharacter(character) {
        this.content = character;
    }

    clear() {
        this.content = "empty";
    }

    render() {
        const element = document.createElement("div");
        element.classList.add("map__cell");
        element.dataset.x = this.x;
        element.dataset.y = this.y;
        element.dataset.testid = `map-cell-${this.x}-${this.y}`;

        if (this.isObstacle()) {
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