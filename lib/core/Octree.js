class Octree {
    constructor(size) {
        this.root = new Root();

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

                if(node.get(index)) node = node.get(index);
                else { // No children at the set position
                    return new PathNode(node, sizeFactor, origin);
                };
            }

            // Leaf
            if(node.get(index)) return new PathNode(node.get(index), 1, p);

            // Size 2 node - for some reason never happened
            return new PathNode(node, sizeFactor);
        }

        this.get = (x, y, z, min) => {
            const minSize = min || 1;
            if(!this.in(x, y, z)) return null;

            let node = this.root,
                sizeFactor = size,
                nextFactor = sizeFactor / 2,
                center = new Point(nextFactor, nextFactor, nextFactor),
                origin = new Point(0, 0, 0),
                index = 0;
        
            while(sizeFactor != 1) { // minimal size
                if(minSize === sizeFactor) return node;

                index = 0;
                sizeFactor /= 2;
                nextFactor /= 2;

                if (z > center.z) {
                    index += 4;
                    center.z += nextFactor;
                    origin.z += sizeFactor;
                } 
                else center.z -= nextFactor;

                if (y > center.y) {
                    index += 2;
                    center.y += nextFactor;
                    origin.y += sizeFactor;
                } 
                else center.y -= nextFactor;

                if (x > center.x) {
                    index += 1;
                    center.x += nextFactor;
                    origin.x += sizeFactor;
                } 
                else center.x -= nextFactor;

                if(node.get(index)) node = node.get(index);
                else return node; // No children at the set position, return the parent
            }

            return node.get(index);
        }

        this.setAt = (x, y, z, materialRef) => {
            if(!materialRef) return;
            const p = new Point(x, y, z);
            let node = this.root,
                sizeFactor = size,
                center = new Point(
                    (sizeFactor / 2),
                    (sizeFactor / 2),
                    (sizeFactor / 2)
                ),
                index = 0,
                depth = 0;
        
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

                if(!node.leaf && node.get(index)) node = node.get(index);
                else node = node.add(index, materialRef);

                depth++;
            }
            
            node.add(index, materialRef);
        };
        
        this.set = (x, y, z, materialRef) => {
            if(!materialRef) return;
            const p = new Point(x, y, z);
            let node = this.root,
                sizeFactor = size,
                center = new Point(
                    (sizeFactor / 2),
                    (sizeFactor / 2),
                    (sizeFactor / 2)
                ),
                index = 0,
                depth = 0;
        
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
                    const newNode = node.nodes[index] = new Node(index, node, materialRef);
                    node = node.add(index, materialRef);
                };

                depth++;
            }

            node.children = true;
            const newNode = new Leaf(index, node, materialRef);
            node.nodes[index] = newNode;
        }
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

    rayCast(origin, vector, renderDistance) {
        // Target Voxel
        const originNode = this.getNode(origin.x, origin.y, origin.z);
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

class PathNode {
    constructor(node, size, origin) {
        this.node = node;
        this.size = size;
        this.origin = origin;
    }
}

class BaseNode {
    constructor(parent) {
        this.parent = parent;
    }

    up(i) {
        if(i < 4) return this.parent.up(i);
        else return this.parent.nodes[i];
    }

    down(i) {
        if(i < 4) return this.parent.nodes[i];
        else return this.parent.down(i);
    }

    left(i) {
        if(i % 2 === 0) return this.parent.left(i + 1);
        else return this.parent.nodes[i - 1];
    }

    right(i) {
        if(i % 2 !== 0) return this.parent.right(i - 1);
        else return this.parent.nodes[i + 1];
    }

    front(i) {
        if(i === 0 || i === 1 || i === 4 || i === 5) return this.parent.nodes[i + 2];
        else return this.parent.front(i - 2);
    }

    back(i) {
        if(i === 0 || i === 1 || i === 4 || i === 5) return this.parent.back(i - 2);
        else return this.parent.nodes[i + 2];
    }

    getIndex() {
        return this.parent.nodes.indexOf(this);
    }
}

class Root {
    constructor() {
        this.leaf = false;
        this.nodes = new Array(8);
    }

    get(i) { return this.nodes[i]; }
    add(i, material) { return this.nodes[i] = new Node(this, material); }
    remove(i) { this.nodes[i] = undefined; }

    up(i) { return false; }
    down(i) { return false; }
    left(i) { return false; }
    right(i) { return false; }
    front(i) { return false; }
    back(i) { return false; }
    getIndex() { return false; }
}

class Node extends BaseNode {
    constructor(parent, material) {
        super(parent);
        this.material = material;
        this.leaf = true;
        this.nodes = undefined;
    }

    get(i) { return this.nodes[i]; }

    add(i, material) {
        if(!this.children) {
            this.nodes = new Array(8);
            this.leaf = false;
        } else {
            // @TODO 
        }
        return this.nodes[i] = new Node(this, material);
    }

    remove(i) {
        this.nodes[i] = undefined;
        this.leaf = this.nodes.some();
        if(!this.leaf) return;
        this.nodes = undefined;
    }
}