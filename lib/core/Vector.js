class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const _length = this.getLength();

        this.x /= _length;
        this.y /= _length;
        this.z /= _length;

        return this;
    }

    getInverse() {
        return new Vector(-this.x, -this.y, -this.z);
    }

    getCopy() {
        return new Vector(this.x, this.y, this.z);
    }

    equals(v) {
        return v.x === this.x && v.y === this.y && v.z === this.z;
    }

    dot(v) {
        return (this.x * v.x + this.y * v.y + this.z * v.z);
    }

    angleTo(v) {
        return Math.acos(this.dot(v));
    }

    rotate(quaternion) {
        quaternion.rotateVector(this);
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }

    div(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;

        return this;
    }

    static fromPoints(p1, p2) {
        return new Vector(
            p2.x - p1.x,
            p2.y - p1.y,
            p2.z - p1.z
        ).normalize();
    }
}