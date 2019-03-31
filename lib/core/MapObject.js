class MapObject {
    constructor(origin, target, material, faceVoxel) {
        this.getOrigin = () => origin;
        this.getTarget = () => target;
        this.getMaterial = () => material;
        this.getFaceVoxel = () => faceVoxel;

        this.getNormal = () => {
            return new Vector(
                origin.x - faceVoxel.x,
                origin.y - faceVoxel.y,
                origin.z - faceVoxel.z
            )
        }
    }
}