class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static distance(p1, p2) {
        return Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );
    }

    distanceTo(p) {
        return Point.distance(this, p);
    }

    toVector(x, y, z) {
        return new Vector(x - this.x, y - this.y, z - this.z);
    }

    equalTo(p) {
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
    }

    equals(p) {
        return (this.x === p.x && this.y === p.y && this.z === p.z);
    }

    getCopy() {
        return new Point(this.x, this.y, this.z);
    }

    add(p) {
        this.x += p.x;
        this.y += p.y;
        this.z += p.z;

        return this;
    }
}