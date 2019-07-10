

class PathNode {
    constructor(node, size, origin, depth, center, index) {
        this.node = node;
        this.size = size;
        this.origin = origin;
        this.depth = depth;
        this.center = center;
        this.index = index;
    }
}

class BaseNode {
    constructor(parent) {
        this.parent = parent;
    }

    up(i) {
        if(i < 4) return this.parent.nodes[i + 4];
        else return this.parent.up(i - 4);
    }

    down(i) {
        if(i < 4) return this.parent.down(i - 4);
        else return this.parent.nodes[i + 4];
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
                lastIndex = 0;
                index = 0,
                depth = 0;
        
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
                
                if(node.get(index)) { 
                    node = node.get(index);
                    depth++;
                    lastIndex = index;
                } else { // No children at the set position
                    return new PathNode(node, sizeFactor, origin, depth, center, lastIndex);
                };
            }

            // Leaf
            if(node.get(index)) return new PathNode(node.get(index), 1, p, depth + 1, new Point(p.x + 0.5, p.y + 0.5, p.z + 0.5), index);

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

    rayCast(originP3f, directionV3f) {
        // Target Voxel
        const node = this.getNode(originP3f.x, originP3f.y, originP3f.z);

        let
        voxelSize = node.size;
        relativeIndex = node.index;
        targetx = Math.floor(node.origin.x),
        targety = Math.floor(node.origin.y),
        targetz = Math.floor(node.origin.z),
        stepx = (directionV3f.x !== 0) ? Math.abs(1 / directionV3f.x) * voxelSize : Number.MAX_VALUE,
        stepy = (directionV3f.y !== 0) ? Math.abs(1 / directionV3f.y) * voxelSize : Number.MAX_VALUE,
        stepz = (directionV3f.z !== 0) ? Math.abs(1 / directionV3f.z) * voxelSize : Number.MAX_VALUE,
        directionx = (directionV3f.x < 0) ? -1 : 1,
        directiony = (directionV3f.y < 0) ? -1 : 1,
        directionz = (directionV3f.z < 0) ? -1 : 1,
        nextx = (directionV3f.x !== 0) ? ((targetx + (directionV3f.x > 0 ? voxelSize : 0)) - origin.x) / directionV3f.x : Number.MAX_VALUE,
        nexty = (directionV3f.y !== 0) ? ((targety + (directionV3f.y > 0 ? voxelSize : 0)) - origin.y) / directionV3f.y : Number.MAX_VALUE,
        nextz = (directionV3f.z !== 0) ? ((targetz + (directionV3f.z > 0 ? voxelSize : 0)) - origin.z) / directionV3f.z : Number.MAX_VALUE,
        vx = false,
        vy = false,
        vz = false;

        do {
            vx = (nextx <= nexty && nextx <= nextz);
            vy = (nexty <= nextx && nexty <= nextz);
            vz = (nextz <= nextx && nextz <= nexty);

            nextx += vx * stepx;
            nexty += vy * stepy;
            nextz += vz * stepz;

            targetx += vx * directionx;
            targety += vy * directiony;
            targetz += vz * directionz;

            if(vx) {
                if(directionV3f.x > 0) node = node.right(relativeIndex);
                else node = node.left(relativeIndex);
            } else if(vy) {
                if(directionV3f.y > 0) node.up(relativeIndex);
                else node = node.down(relativeIndex);
            } else {
                if(directionV3f.z > 0) node = node.front(relativeIndex);
                else node = node.back(relativeIndex);
            }
        } while(node);

        return null;
    }
}