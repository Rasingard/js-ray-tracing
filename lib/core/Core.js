class Core {
    constructor() {

    }

    static ran(min, max) {
        return Math.random() * (max - min) + min
    }
}