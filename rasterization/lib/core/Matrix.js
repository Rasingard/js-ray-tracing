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

class Matrix4 {
    constructor() {
        this.data = new Float32Array(16);

        this.get00 = () => this.data[0];
        this.get01 = () => this.data[1];
        this.get02 = () => this.data[2];
        this.get03 = () => this.data[3];
        this.get10 = () => this.data[4];
        this.get11 = () => this.data[5];
        this.get12 = () => this.data[6];
        this.get13 = () => this.data[7];
        this.get20 = () => this.data[8];
        this.get21 = () => this.data[9];
        this.get22 = () => this.data[10];
        this.get23 = () => this.data[11];
        this.get30 = () => this.data[12];
        this.get31 = () => this.data[13];
        this.get32 = () => this.data[14];
        this.get33 = () => this.data[15];

        this.set00 = (val) => this.data[0] = val;
        this.set01 = (val) => this.data[1] = val;
        this.set02 = (val) => this.data[2] = val;
        this.set03 = (val) => this.data[3] = val;
        this.set10 = (val) => this.data[4] = val;
        this.set11 = (val) => this.data[5] = val;
        this.set12 = (val) => this.data[6] = val;
        this.set13 = (val) => this.data[7] = val;
        this.set20 = (val) => this.data[8] = val;
        this.set21 = (val) => this.data[9] = val;
        this.set22 = (val) => this.data[10] = val;
        this.set23 = (val) => this.data[11] = val;
        this.set30 = (val) => this.data[12] = val;
        this.set31 = (val) => this.data[13] = val;
        this.set32 = (val) => this.data[14] = val;
        this.set33 = (val) => this.data[15] = val;

        this.set3DL0 = (point3D) => {
            this.set00(point3D.x);
            this.set01(point3D.y);
            this.set02(point3D.z);
        }

        this.set3DL1 = (point3D) => {
            this.set10(point3D.x);
            this.set11(point3D.y);
            this.set12(point3D.z);
        }

        this.set3DL2 = (point3D) => {
            this.set20(point3D.x);
            this.set21(point3D.y);
            this.set22(point3D.z);
        }

        this.set3DL3 = (point3D) => {
            this.set30(point3D.x);
            this.set31(point3D.y);
            this.set32(point3D.z);
        }

        this.set3DC0 = (point3D) => {
            this.set00(point3D.x);
            this.set10(point3D.y);
            this.set20(point3D.z);
        }

        this.set3DC1 = (point3D) => {
            this.set01(point3D.x);
            this.set11(point3D.y);
            this.set21(point3D.z);
        }

        this.set3DC2 = (point3D) => {
            this.set02(point3D.x);
            this.set12(point3D.y);
            this.set22(point3D.z);
        }

        this.set3DC3 = (point3D) => {
            this.set03(point3D.x);
            this.set13(point3D.y);
            this.set23(point3D.z);
        }

        this.transform3D = (point3D) => {
            const x = point3D.x;
            const y = point3D.y;
            const z = point3D.z;

            point3D.x = x * this.get00() + y * this.get10() + z * this.get20() + this.get30();
            point3D.y = x * this.get01() + y * this.get11() + z * this.get21() + this.get31();
            point3D.z = x * this.get02() + y * this.get12() + z * this.get22() + this.get32();

            return point3D;
        }

        this.getBuffer = () => this.data.buffer;
    }

    getInverse() {
        const newMatrix = new Matrix4();

        // Transpose X
        newMatrix.set00(this.get00());
        newMatrix.set10(this.get01());
        newMatrix.set20(this.get02());
        newMatrix.set03(0);

        // Transpose Y
        newMatrix.set01(this.get10());
        newMatrix.set11(this.get11());
        newMatrix.set21(this.get12());
        newMatrix.set13(0);

        // Transpose Z
        newMatrix.set02(this.get20());
        newMatrix.set22(this.get21());
        newMatrix.set12(this.get22());
        newMatrix.set23(0);
        
        // Invert  Transpose
        newMatrix.set30(-this.get30());
        newMatrix.set31(-this.get31());
        newMatrix.set32(-this.get32());
        newMatrix.set33(1);

        return newMatrix;
    }

    static tranformation(xAxis, yAxis, zAxis, origin3D) {
        const newMatrix = new Matrix4();
        
        newMatrix.set3DL0(xAxis);
        newMatrix.set3DL1(yAxis);
        newMatrix.set3DL2(zAxis);
        newMatrix.set3DL3(origin3D);
        newMatrix.set33(1);

        return newMatrix;
    }

    static invertTransformation(xAxis, yAxis, zAxis, origin3D) {
        const newMatrix = new Matrix4();
        
        newMatrix.set3DC0(xAxis);
        newMatrix.set3DC1(yAxis);
        newMatrix.set3DC2(zAxis);
        newMatrix.set30((-origin3D.x * xAxis.x) +  (-origin3D.y * xAxis.y) + (-origin3D.z * xAxis.z));
        newMatrix.set31((-origin3D.x * yAxis.x) +  (-origin3D.y * yAxis.y) + (-origin3D.z * yAxis.z));
        newMatrix.set32((-origin3D.x * zAxis.x) +  (-origin3D.y * zAxis.y) + (-origin3D.z * zAxis.z));
        newMatrix.set33(1);

        return newMatrix;
    }

    static perspective(near, far, fovx, fovy) {
        const newMatrix = new Matrix4();

        newMatrix.set00(Math.atan(fovx / 2));
        newMatrix.set11(Math.atan(fovy / 2));
        newMatrix.set22( -((far + near) / (far - near)) );
        newMatrix.set23( -((2 * near * far) / (far - near) ) );
        newMatrix.set32( -1);

        return newMatrix;
    }
}