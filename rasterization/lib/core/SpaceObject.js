class SpaceObject {
    constructor(location) {
        this.location = location;

        this.axis = {
            x: new Vector(1, 0, 0),
            y: new Vector(0, 1, 0),
            z: new Vector(0, 0, 1),
        };

        this.rotation = {
            x: 0,
            y: 0,
            z: 0,
        }
    }

    rotate(quaternion) {
        quaternion.rotateVector(this.axis.x);
        quaternion.rotateVector(this.axis.y);
        quaternion.rotateVector(this.axis.z);
    }

    rotateOver(point, quaternion) {
        const matrix = quaternion.matrixRotation(point);
        matrix.applyRotation(this.location);
    }
}