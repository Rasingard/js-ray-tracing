class Octree {
    constructor(size) {
        this.root = new Node(0);

        // start: MATERIAL
        const materials = new Array();
        this.addMaterial = (material) => {
            material.index = materials.length;
            materials.push(material);
            return material.index;
        }
        this.getMaterial = (ref) => materials[ref];
        // end: MATERIAL

        this.getDimensions = () => [size, size, size];
        this.getSize = () => size;
        this.getX = () => size;
        this.getY = () => size;
        this.getZ = () => size;
        this.xIn = (x) => (x >= 0 && x < size);
        this.yIn = (y) => this.xIn(y);
        this.zIn = (z) => this.xIn(z);
        this.in = (x, y, z) => (this.xIn(x) && this.yIn(y) && this.zIn(z));

        this.getAt = (x, y, z) => {
            const p = new Point(x, y, z);
            let node = this.root,
                sizeFactor = size,
                nextFactor = sizeFactor / 2,
                center = new Point(nextFactor, nextFactor, nextFactor),
                index = 0,
                dx, dy, dz;
        
            while(sizeFactor != 1) {
                index = 0;
                sizeFactor = nextFactor;
                nextFactor /= 2;
                
                if (p.z > center.z) {
                    index += 4;
                    center.z += nextFactor;
                } else {
                    center.z -= nextFactor;
                };

                if (p.y > center.y) {
                    index += 2;
                    center.y += nextFactor;
                } else {
                    center.y -= nextFactor;
                };

                if (p.x > center.x) {
                    index += 1;
                    center.x += nextFactor;
                } else {
                    center.x -= nextFactor;
                };

                if(node.nodes[index]) node = node.nodes[index];
                else return null;
            }

            return node.nodes[index];
        }

        this.getNode = (p) => {
            let node = this.root,
                sizeFactor = size,
                nextFactor = sizeFactor / 2,
                center = new Point(nextFactor, nextFactor, nextFactor),
                origin = new Point(0, 0, 0),
                index = 0;
        
            while(sizeFactor != 1) {
                index = 0;
                sizeFactor /= 2;
                nextFactor /= 2;

                if (p.z > center.z) {
                    index += 4;
                    center.z += nextFactor;
                    origin.z += sizeFactor;
                } else {
                    center.z -= nextFactor;
                };

                if (p.y > center.y) {
                    index += 2;
                    center.y += nextFactor;
                    origin.y += sizeFactor;
                } else {
                    center.y -= nextFactor;
                };

                if (p.x > center.x) {
                    index += 1;
                    center.x += nextFactor;
                    origin.x += sizeFactor;
                } else {
                    center.x -= nextFactor;
                };

                if(node.nodes[index]) node = node.nodes[index];
                else { // No children at the set position
                    return new PathNode(node, sizeFactor, origin);
                };
            }

            // Leaf
            if(node.nodes[index]) return new PathNode(node.nodes[index], 1, p);

            // Size 2 node - for some reason never heappen
            return new PathNode(node, sizeFactor);
        }

        this.setAt = (x, y, z, color) => {
            if(!color) return;
            const p = new Point(x, y, z);
            let node = this.root,
                sizeFactor = size,
                center = new Point(
                    (sizeFactor / 2),
                    (sizeFactor / 2),
                    (sizeFactor / 2)
                ),
                index = 0;
        
            while(sizeFactor != 1) {
                index = 0;
                sizeFactor /= 2;

                if (p.z > center.z) {
                    index += 4;
                    center.z += sizeFactor / 2;
                } else {
                    center.z -= sizeFactor / 2;
                };

                if (p.y > center.y) {
                    index += 2;
                    center.y += sizeFactor / 2;
                } else {
                    center.y -= sizeFactor / 2;
                };

                if (p.x > center.x) {
                    index += 1;
                    center.x += sizeFactor / 2;
                } else {
                    center.x -= sizeFactor / 2;
                };

                if(node.nodes[index]) node = node.nodes[index];
                else {
                    node.children = true;
                    node = node.nodes[index] = new Node();
                };
            }

            node.children = true;
            node.nodes[index] = new Leaf(color);
        };
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

    rayTrace(origin, vector, renderDistance) {
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
            if (tm = this.getAt(v.x, v.y, v.z)) {
                return new RayData(this, origin, vector, v, renderDistance, tm.color, sx, sy, sz, tx, ty, tz, dx, dy, dz, vx, vy, vz);
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

    rayTraceTeste(origin, vector, renderDistance) {
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
            tm = this.getNode(v);
            if (tm.node instanceof Leaf) {
                return new RayData(this, origin, vector, v, renderDistance, tm.node.color, sx, sy, sz, tx, ty, tz, dx, dy, dz, vx, vy, vz);
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

class Node {
    constructor() {
        this.children = false;
        this.nodes = new Array(8);
    }
}

class PathNode {
    constructor(node, size, origin) {
        this.node = node;
        this.size = size;
        this.origin = origin;
    }
}

class Leaf {
    constructor(color) {
        this.color = color;
    }
}