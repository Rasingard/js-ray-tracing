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

    inverse() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;

        return this;
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

    cross(v) {
        return new Vector(
            (this.y * v.z) - (this.z * v.y),
            (this.z * v.x) - (this.x * v.z),
            (this.x * v.y) - (this.y * v.x),
        );
    }

    angleTo(v) {
        return Math.acos(this.dot(v));
    }

    rotate(quaternion) {
        quaternion.rotateVector(this);
    }

    reflect(normal) {
        const dot = this.dot(normal);
        this.x -= (2 * dot * normal.x);
        this.y -= (2 * dot * normal.y);
        this.z -= (2 * dot * normal.z);

        return this;
    }

    reflected(normal) {
        return new Vector(
            this.x - (2 * (this.x * normal.x) * normal.x),
            this.y - (2 * (this.y * normal.y) * normal.y),
            this.z - (2 * (this.z * normal.z) * normal.z),
        );
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }

    addVector(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;

        return this;
    }

    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;

        return this;
    }

    div(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;

        return this;
    }

    rotateAxisAngle(axis, angle) {
        const q = new Quaternion.fromAxisAngle(axis, angle);
        const _x2 = Math.pow(q.x, 2);
        const _y2 = Math.pow(q.y, 2);
        const _z2 = Math.pow(q.z, 2);
        const _2xy = 2 * q.x * q.y;
        const _2wz = 2 * q.z * q.w;
        const _2xz = 2 * q.x * q.z;
        const _2wy = 2 * q.y * q.w;
        const _2yz = 2 * q.y * q.z;
        const _2wx = 2 * q.x * q.w;

        const tempX =
            (vector.x * 1 - 2 * (_y2 + _z2)) +
            (vector.y * (_2xy + _2wz)) +
            (vector.z * (_2xz - _2wy));

        const tempY =
            (vector.x * (_2xy - _2wz)) +
            (vector.y * 1 - 2 * (_x2 + _z2)) +
            (vector.z * (_2yz + _2wx));

        const tempZ =
            (vector.x * (_2xz + _2wy)) +
            (vector.y * (_2yz - _2wx)) +
            (vector.z * 1 - 2 * (_x2 + _y2));

        vector.x = tempX;
        vector.y = tempY;
        vector.z = tempZ;
    }

    static fromPoints(p1, p2) {
        return new Vector(
            p2.x - p1.x,
            p2.y - p1.y,
            p2.z - p1.z
        ).normalize();
    }
}