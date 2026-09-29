class Cell {
    constructor(x, y, content = "empty") {
        this._x = x;
        this._y = y;
        this._content = content;
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
        return this._content === "obstacle";
    }

    get isEmpty() {
        return this._content === "empty";
    }
}