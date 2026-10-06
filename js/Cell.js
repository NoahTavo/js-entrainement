class Cell {
    static EMPTY = "empty";
    static OBSTACLE = "obstacle";

    constructor(x, y, content = Cell.EMPTY) {
        this._x = x;
        this._y = y;
        this._content = content;
        this._weapon = null;
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

    get isObstacle() {
        return this._content === Cell.OBSTACLE;
    }

    get isEmpty() {
        return this._content === Cell.EMPTY;
    }
    get weapon() {
        return this._weapon;
    }

    set weapon(value) {
        this._weapon = value;
    }
}