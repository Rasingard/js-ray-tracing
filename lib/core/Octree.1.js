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
                else return null;
            }

            return node.nodes[index];
        }

        this.setAt = (x, y, z, color) => {
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
                else node = node.nodes[index] = new Node();
            }

            node.nodes[index] = color;
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

    rayIntersectionPoint(origin, vector, target, vx, vy) {
        if(vx) {
            const t = (target.x - origin.x) / vector.x;
            return new Point(
                t,
                vector.y * t + origin.y,
                vector.z * t + origin.z,
            );
        }

        if(vy) {
            const t = (target.y - origin.y) / vector.y;
            return new Point(
                vector.x * t + origin.x,
                t,
                vector.z * t + origin.z,
            );
        }
        
        const t = (target.z - origin.z) / vector.z;
        return new Point(
            vector.x * t + origin.x,
            vector.y * t + origin.y,
            t,
        )
    }

    rayNormalIntersect(sx, sy, sz, vx, vy) {
        if(vx) return new Vector(sx, 0, 0);
        if(vy) return new Vector(0, sy, 0);
        return new Vector(0, 0, sz)
    }

    rayTrace(origin, vector, renderDistance) {
        // Target Voxel
        const v = new Point(
            Math.floor(origin.x),
            Math.floor(origin.y),
            Math.floor(origin.z),
        );

        const dx = (vector.x !== 0) ? Math.abs(1 / vector.x) : Number.MAX_VALUE;
        const dy = (vector.y !== 0) ? Math.abs(1 / vector.y) : Number.MAX_VALUE;
        const dz = (vector.z !== 0) ? Math.abs(1 / vector.z) : Number.MAX_VALUE;

        const sx = (vector.x < 0) ? -1 : 1;
        const sy = (vector.y < 0) ? -1 : 1;
        const sz = (vector.z < 0) ? -1 : 1;
        
        let tx = (vector.x !== 0) ? (v.x + sx - origin.x) / vector.x : Number.MAX_VALUE,
            ty = (vector.y !== 0) ? (v.y + sy - origin.y) / vector.y : Number.MAX_VALUE,
            tz = (vector.z !== 0) ? (v.z + sz - origin.z) / vector.z : Number.MAX_VALUE,
            vx, vy, vz, 
            tm,
            distance = 0;

        do {
            tm = this.getAt(v.x, v.y, v.z);
            if (tm) { 
                return new Shader(
                    origin,
                    v,
                    this.getMaterial(tm),
                    this.rayNormalIntersect(sx, sy, sz, vx, vy),
                    vector,
                    this.rayIntersectionPoint(origin, vector, v, vx, vy, vz),
                    distance,
                    renderDistance,
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

            distance = Point.distance(origin, v);
        } while(this.in(v.x, v.y, v.z) && distance < renderDistance);

        return null;
    }
}

class Node {
    constructor(size) {
        this.nodes = new Array(8);
    }
}

class Leaf {
    constructor(color) {
        this.color = color;
    }
}