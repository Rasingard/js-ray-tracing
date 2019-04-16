class Quaternion {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static fromAxisAngle(axis, angle) {
        const rads = -angle * (Math.PI / 180);
        const s = Math.sin(rads / 2);

        return new Quaternion(
            axis.x * s,
            axis.y * s,
            axis.z * s,
            Math.cos(rads / 2),
        );
    }

    getLength() {
        return Math.sqrt(
            Math.pow(this.x, 2) +
            Math.pow(this.y, 2) +
            Math.pow(this.z, 2) +
            Math.pow(this.w, 2)
        );
    }

    normalize() {
        const _length = this.getLength();

        this.x /= _length;
        this.y /= _length;
        this.z /= _length;
        this.w /= _length;
    }

    multiply(q) {
        const tempW = (this.w * q.w) - (this.x * q.x) - (this.y * q.y) - (this.z * q.z);
        const tempX = (this.w * q.x) + (this.x * q.w) + (this.y * q.z) - (this.z * q.y);
        const tempY = (this.w * q.y) - (this.x * q.z) + (this.y * q.w) + (this.z * q.x);
        const tempZ = (this.w * q.z) + (this.x * q.y) - (this.y * q.x) + (this.z * q.w);

        this.w = tempW;
        this.x = tempX;
        this.y = tempY;
        this.z = tempZ;

        return this;
    }

    rotateVector(vector) {
        const _x2 = this.x * this.x;
        const _y2 = this.y * this.y;
        const _z2 = this.z * this.z;
        const _2xy = 2 * this.x * this.y;
        const _2wz = 2 * this.z * this.w;
        const _2xz = 2 * this.x * this.z;
        const _2wy = 2 * this.y * this.w;
        const _2yz = 2 * this.y * this.z;
        const _2wx = 2 * this.x * this.w;

        const tempX =
            (vector.x * (1 - 2 * (_y2 + _z2))) +
            (vector.y * (_2xy + _2wz)) +
            (vector.z * (_2xz - _2wy));

        const tempY =
            (vector.x * (_2xy - _2wz)) +
            (vector.y * (1 - 2 * (_x2 + _z2))) +
            (vector.z * (_2yz + _2wx));

        const tempZ =
            (vector.x * (_2xz + _2wy)) +
            (vector.y * (_2yz - _2wx)) +
            (vector.z * (1 - 2 * (_x2 + _y2)));

        vector.x = tempX;
        vector.y = tempY;
        vector.z = tempZ;

        return vector;
    }

    vectorRotationMatrix() {
        const _x2 = this.x * this.x;
        const _y2 = this.y * this.y;
        const _z2 = this.z * this.z;
        const _2xy = 2 * this.x * this.y;
        const _2wz = 2 * this.z * this.w;
        const _2xz = 2 * this.x * this.z;
        const _2wy = 2 * this.y * this.w;
        const _2yz = 2 * this.y * this.z;
        const _2wx = 2 * this.x * this.w;

        return matrix = [
            [1 - 2 * (_y2 + _z2), (_2xy + _2wz), (_2xz - _2wy)],
            [(_2xy - _2wz), 1 - 2 * (_x2 + _z2), (_2yz + _2wx)],
            [(_2xz + _2wy), (_2yz - _2wx), 1 - 2 * (_x2 + _y2)],  
        ];
    }

    matrixRotation(point) {
        const _w2 = Math.pow(this.w, 2);
        const _x2 = Math.pow(this.x, 2);
        const _y2 = Math.pow(this.y, 2);
        const _z2 = Math.pow(this.z, 2);
        const _2xy = 2 * this.x * this.y;
        const _2wz = 2 * this.z * this.w;
        const _2xz = 2 * this.x * this.z;
        const _2wy = 2 * this.y * this.w;
        const _2yz = 2 * this.y * this.z;
        const _2wx = 2 * this.x * this.w;

        const _matrix = [
            [(_w2 + _x2 - _y2 - _z2), (_2xy + _2wz), (_2xz - _2wy), 0],
            [(_2xy - _2wz), (_w2 - _x2 + _y2 - _z2), (_2yz + _2wx), 0],
            [(_2xz + _2wy), (_2yz - _2wx), (_w2 - _x2 - _y2 + _z2), 0],
            [0, 0, 0, 1],
        ];

        if (point) {
            _matrix[0][3] =
                point.x - point.x * _matrix[0][0] - point.y * _matrix[0][1] - point.z * _matrix[
                    0][2];
            _matrix[1][3] =
                point.y - point.x * _matrix[1][0] - point.y * _matrix[1][1] - point.z * _matrix[
                    1][2];
            _matrix[2][3] =
                point.z - point.x * _matrix[2][0] - point.y * _matrix[2][1] - point.z * _matrix[
                    2][2];
        }

        return new Matrix(_matrix, point);
    }
}