class Line {
    constructor(origin, vector) {
        this.origin = origin;
        this.vector = vector;
        this.stepX = 0;
        this.stepY = 0;
        this.stepZ = 0;

        if (this.vector.x === 1) this.stepX = 1;
        else if (this.vector.y === 1) this.stepY = 1;
        else if (this.vector.z === 1) this.stepZ = 1;
        else {
            this.stepX = 1 / this.vector.x;
            this.stepY = 1 / this.vector.y;
            this.stepZ = 1 / this.vector.z;
        }
    }

    // X
    xEquals(xVal) {
        return {
            x: xVal,
            y: (((xVal - this.origin.x) / this.vector.x) * this.vector.y) + this.origin.y,
            z: (((xVal - this.origin.x) / this.vector.x) * this.vector.z) + this.origin.z,
        }
    }
    xEqualsY(xVal) {
        return (((xVal - this.origin.x) / this.vector.x) * this.vector.y) + this.origin.y;
    }
    xEqualsZ(xVal) {
        return (((xVal - this.origin.x) / this.vector.x) * this.vector.z) + this.origin.z;
    }
    static pointXEquals(origin, vector, x) {
        return {
            x: x,
            y: (((x - origin.x) / vector.x) * vector.y) + origin.y,
            z: (((x - origin.x) / vector.x) * vector.z) + origin.z,
        }
    }

    // Y
    yEquals(yVal) {
        return {
            x: (((yVal - this.origin.y) / this.vector.y) * this.vector.x) + this.origin.x,
            y: yVal,
            z: (((yVal - this.origin.y) / this.vector.y) * this.vector.z) + this.origin.z,
        }
    }
    yEqualsX(yVal) {
        return (((yVal - this.origin.y) / this.vector.y) * this.vector.x) + this.origin.x;
    }
    yEqualZ(yVal) {
        return (((yVal - this.origin.y) / this.vector.y) * this.vector.z) + this.origin.z;
    }
    static pointYEquals(origin, vector, y) {
        return {
            x: (((y - origin.y) / vector.y) * vector.x) + origin.x,
            y: y,
            z: (((y - origin.y) / vector.y) * vector.z) + origin.z,
        }
    }

    // Z
    zEquals(zVal) {
        return {
            x: (((zVal - this.origin.z) / this.vector.z) * this.vector.x) + this.origin.x,
            y: (((zVal - this.origin.z) / this.vector.z) * this.vector.y) + this.origin.y,
            z: zVal,
        }
    }
    zEqualsX(zVal) {
        return (((zVal - this.origin.z) / this.vector.z) * this.vector.x) + this.origin.x;
    }

    zEqualsY(zVal) {
        return (((zVal - this.origin.z) / this.vector.z) * this.vector.y) + this.origin.y;
    }
    static pointZEquals(origin, vector, z) {
        return {
            x: (((z - origin.z) / vector.z) * vector.x) + origin.x,
            y: (((z - origin.z) / vector.z) * vector.y) + origin.y,
            z: z,
        }
    }
}
