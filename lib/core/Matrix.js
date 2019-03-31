class Matrix {
    constructor(matrix) {
        this.matrix = matrix;
    }

    applyRotation(point) {
        const tempX = (1 * this.matrix[0][3]) +
            (point.x * this.matrix[0][0]) +
            (point.y * this.matrix[0][1]) +
            (point.z * this.matrix[0][2]);

        const tempY = (1 * this.matrix[1][3]) +
            (point.x * this.matrix[1][0]) +
            (point.y * this.matrix[1][1]) +
            (point.z * this.matrix[1][2]);

        const tempZ = (1 * this.matrix[2][3]) +
            (point.x * this.matrix[2][0]) +
            (point.y * this.matrix[2][1]) +
            (point.z * this.matrix[2][2]);

        point.x = tempX;
        point.y = tempY;
        point.z = tempZ;

        return point;
    }
}