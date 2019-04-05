class MapView {
    constructor(buffer, sX, sY, sZ, materialsBuffer, texturesBuffer, globalLightBuffer, ambientLightBuffer) {
        const _root = new Uint8ClampedArray(buffer);

        this.getAt = (x, y, z) => _root[this.index(x, y, z)];
        this.index = (x, y, z) => (z * sX * sY) + (y * sX) + x;
        this.getDimensions = () => [sX, sY, sZ];
        this.getX = () => sX;
        this.getY = () => sY;
        this.getZ = () => sZ;
        this.in = (x, y, z) => (x >= 0 && y >= 0 && z >= 0 && x < sX && y < sY && z < sZ);
        this.xIn = (x) => (x >= 0 && x < sX);
        this.yIn = (y) => (y >= 0 && y < sY);
        this.zIn = (z) => (z >= 0 && z < sZ);

        // Materials
        const materials = new MaterialListView(materialsBuffer);
        this.getMaterial = (index) => materials.get(index);

        // Textures
        const textures = new TextureListView(texturesBuffer);
        this.getTexture = (index) => textures.get(index);

        // Lights
        const globalLight = new GlobalLightView(globalLightBuffer);
        this.getGlobalLight = () => globalLight;
        const ambientLight = new AmbientLightView(ambientLightBuffer);
        this.getAmbientLight = () => ambientLight;
    }

    rayTrace(origin, vector, renderDistance) {
        // Target Voxel
        const v = new Point(Math.floor(origin.x), Math.floor(origin.y), Math.floor(origin.z));

        const sx = (vector.x < 0) ? -1 : 1;
        const sy = (vector.y < 0) ? -1 : 1;
        const sz = (vector.z < 0) ? -1 : 1;

        let dx = (vector.x !== 0) ? Math.abs(1 / vector.x) : Number.MAX_VALUE;
        let dy = (vector.y !== 0) ? Math.abs(1 / vector.y) : Number.MAX_VALUE;
        let dz = (vector.z !== 0) ? Math.abs(1 / vector.z) : Number.MAX_VALUE;
        
        let
        tx = (vector.x !== 0) ? ((v.x + (sx > 0 ? 1 : 0)) - origin.x) / vector.x : Number.MAX_VALUE,
        ty = (vector.y !== 0) ? ((v.y + (sy > 0 ? 1 : 0)) - origin.y) / vector.y : Number.MAX_VALUE,
        tz = (vector.z !== 0) ? ((v.z + (sz > 0 ? 1 : 0)) - origin.z) / vector.z : Number.MAX_VALUE,
        vx, vy, vz, tm;

        let
        mx = (vector.x < 0) ? Math.max(0, v.x - renderDistance) : Math.min(this.getX(), renderDistance + v.x),
        my = (vector.y < 0) ? Math.max(0, v.y - renderDistance) : Math.min(this.getY(), renderDistance + v.y),
        mz = (vector.z < 0) ? Math.max(0, v.z - renderDistance) : Math.min(this.getZ(), renderDistance + v.z);

        do {
            tm = this.getAt(v.x, v.y, v.z)
            if (tm) {
                return new RayData(
                    this,
                    origin,
                    vector,
                    v,
                    renderDistance,
                    tm, sx, sy, sz, tx, ty, tz, dx, dy, dz, vx, vy, vz
                );
            }

            vx = (tx <= ty && tx <= tz);
            vy = (ty <= tx && ty <= tz);
            vz = (tz <= tx && tz <= ty);

            tx += vx * dx;
            ty += vy * dy;
            tz += vz * dz;

            v.x += vx * sx;
            v.y += vy * sy;
            v.z += vz * sz;
        } while(v.x != mx && v.y != my && mz != v.z);

        return null;
    }
}