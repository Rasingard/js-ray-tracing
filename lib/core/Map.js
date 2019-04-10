class Map {
    constructor(sX, sY, sZ) {
        const buffer = new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 2 * sX * sY * sZ);
        const _root = new Uint8ClampedArray(buffer);

        this.getBuffer = () => buffer;

        this.getAt = (x, y, z) => {
            return _root[this.index(x, y, z)];
        };
        this.setAt = (x, y, z, val) => {
            _root[this.index(x, y, z)] = val;
        };
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
        const materials = new MaterialList();
        this.addMaterial = (color, textureTRef, textureSRef, textureDRef, opacity, specular, roughness) => materials.add(color, textureTRef, textureSRef, textureDRef, opacity, specular, roughness);
        this.getMaterial = (index) => materials.get(index);

        // Textures
        const textures = new TextureList();
        this.getTexture = (index) => textures.get(index);
        this.addTexture = (buffer) => textures.add(buffer);

        // Lights
        const globalLight = new GlobalLight(new Color(255, 250, 175), 1, (new Vector(-2, -1, -2)).normalize() );
        this.getGlobalLight = () => globalLight;

        const ambientLight = new AmbientLight(new Color(132, 235, 255), 0.35);
        this.getAmbientLight = () => ambientLight;

        this.getBuffers = () => {
            return {
                map: buffer,
                x: sX,
                y: sY,
                z: sZ,
                materials: materials.getBuffer(),
                textures: textures.getBuffers(),
                globalLight: globalLight.getBuffer(),
                ambientLight: ambientLight.getBuffer(),
            }
        };

        this.rayData = new RayData(
            this,
            new Point(0,0,0),
            new Vector(0,0,1),
            new Point(0,0,0),
            100,
            1,
            1,
            1,
            1,
            1.1,
            1.1,
            1.1,
            1.1,
            1.1,
            1.1,
            false,
            false,
            false
        );
    }

    addCube(startPoint, cX, cY, cZ, color) {
        for (let x = 0; x < cX; x++) {
            for (let y = 0; y < cY; y++) {
                for (let z = 0; z < cZ; z++) {
                    const currentX = startPoint.x + x;
                    const currentY = startPoint.y + y;
                    const currentZ = startPoint.z + z;

                    if (this.in(currentX, currentY, currentZ)) {
                        this.setAt(currentX, currentY, currentZ, color);
                    }
                }
            }
        }
    }

    setShape(ox, oy, oz, array) {
        array.forEach((i, x) => {
            if(Array.isArray(i)) {
                i.forEach((j, y) => {
                    if(Array.isArray(j)) {
                        j.forEach((k, z) => {
                            if(k && this.in(ox + x, oy + y, oz + z)) this.setAt(ox + x, oy + y, oz + z, k);
                        });
                    } else {
                        if(j && this.in(ox + x, oy + y, oz)) this.setAt(ox + x, oy + y, oz, j);
                    }
                });
            } else {
                if(i && this.in(ox + x, oy, oz)) this.setAt(ox + x, oy, oz, i);
            }
        });
    }

    rayTrace2(origin, vector, renderDistance) {
        // Target Voxel
        const v = new Point(Math.floor(origin.x), Math.floor(origin.y), Math.floor(origin.z));

        const sx = (vector.x < 0) ? -1 : 1;
        const sy = (vector.y < 0) ? -1 : 1;
        const sz = (vector.z < 0) ? -1 : 1;

        const dx = (vector.x !== 0) ? Math.abs(1 / vector.x) : Number.MAX_VALUE;
        const dy = (vector.y !== 0) ? Math.abs(1 / vector.y) : Number.MAX_VALUE;
        const dz = (vector.z !== 0) ? Math.abs(1 / vector.z) : Number.MAX_VALUE;
        
        let 
        tx = (vector.x !== 0) ? (v.x + sx - origin.x) / vector.x : Number.MAX_VALUE,
        ty = (vector.y !== 0) ? (v.y + sy - origin.y) / vector.y : Number.MAX_VALUE,
        tz = (vector.z !== 0) ? (v.z + sz - origin.z) / vector.z : Number.MAX_VALUE,
        vx, vy, vz, tm;

        /*
        let
        mx = (vector.x < 0) ? Math.max(0, v.x - renderDistance) : Math.min(this.getX(), renderDistance + v.x),
        my = (vector.y < 0) ? Math.max(0, v.y - renderDistance) : Math.min(this.getY(), renderDistance + v.y),
        mz = (vector.z < 0) ? Math.max(0, v.z - renderDistance) : Math.min(this.getZ(), renderDistance + v.z);
        */

        let
        mx = Math.max(Math.min(Math.floor((vector.x * renderDistance) + origin.x), this.getX()), 0),
        my = Math.max(Math.min(Math.floor((vector.y * renderDistance) + origin.y), this.getY()), 0),
        mz = Math.max(Math.min(Math.floor((vector.z * renderDistance) + origin.z), this.getZ()), 0);

        do {
            tm = this.getAt(v.x, v.y, v.z);
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

    rayTrace(origin, vector, renderDistance) {
        this.rayData

        // Target Voxel
        const v = new Point(Math.floor(origin.x), Math.floor(origin.y), Math.floor(origin.z));

        const sx = (vector.x < 0) ? -1 : 1;
        const sy = (vector.y < 0) ? -1 : 1;
        const sz = (vector.z < 0) ? -1 : 1;

        const dx = (vector.x !== 0) ? Math.abs(1 / vector.x) : Number.MAX_VALUE;
        const dy = (vector.y !== 0) ? Math.abs(1 / vector.y) : Number.MAX_VALUE;
        const dz = (vector.z !== 0) ? Math.abs(1 / vector.z) : Number.MAX_VALUE;
        
        let 
        tx = (vector.x !== 0) ? (v.x + sx - origin.x) / vector.x : Number.MAX_VALUE,
        ty = (vector.y !== 0) ? (v.y + sy - origin.y) / vector.y : Number.MAX_VALUE,
        tz = (vector.z !== 0) ? (v.z + sz - origin.z) / vector.z : Number.MAX_VALUE,
        vx, vy, vz, tm;

        let
        mx = (vector.x < 0) ? Math.max(0, v.x - renderDistance) : Math.min(this.getX(), renderDistance + v.x),
        my = (vector.y < 0) ? Math.max(0, v.y - renderDistance) : Math.min(this.getY(), renderDistance + v.y),
        mz = (vector.z < 0) ? Math.max(0, v.z - renderDistance) : Math.min(this.getZ(), renderDistance + v.z);

        do {
            tm = this.getAt(v.x, v.y, v.z);
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