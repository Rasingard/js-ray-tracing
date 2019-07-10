class Map {
    constructor(sX, sY, sZ) {
        const materials = new Array();

        const _root = new Uint8Array(sX * sY * sZ * 2);

        const _checkOcclusion = (index) => {
            const _current = _root[index];
            
            if(
                ByteMask.get2(_current) &&
                ByteMask.get3(_current) &&
                ByteMask.get4(_current) &&
                ByteMask.get5(_current) &&
                ByteMask.get6(_current) &&
                ByteMask.get7(_current)
            ) _root[index] = ByteMask.set1(_root[index]);
        }

        this.getAt = (x, y, z) => _root[this.index(x, y, z)];
        this.getMapAt = (x, y, z) => _root[this.index(x, y, z) + 1];
        this.setAt = (x, y, z, val) => {
            const _index = this.index(x, y, z);
            _root[_index] = val;
            const _currentI = _index + 1;

            /**
             * transparent - 0
             * occluded - 1
             * down - 2
             * back - 3
             * left - 4
             * right- 5
             * front- 6
             * up   - 7
             */

            const _downI = this.index(x, y - 1, z);
            const _backI = this.index(x, y, z - 1);
            const _leftI = this.index(x - 1, y, z);
            const _rightI = this.index(x + 1, y, z);
            const _frontI = this.index(x, y, z + 1);
            const _upI = this.index(x, y + 1, z);

            _root[_currentI] = ByteMask.set0(_root[_currentI]);
            if(_root[_downI] > 0) _root[_currentI] = ByteMask.set2(_root[_currentI]);
            if(_root[_backI] > 0) _root[_currentI] = ByteMask.set3(_root[_currentI]);
            if(_root[_leftI] > 0) _root[_currentI] = ByteMask.set4(_root[_currentI]);
            if(_root[_rightI] > 0) _root[_currentI] = ByteMask.set5(_root[_currentI]);
            if(_root[_frontI] > 0) _root[_currentI] = ByteMask.set6(_root[_currentI]);
            if(_root[_upI] > 0) _root[_currentI] = ByteMask.set7(_root[_currentI]);
            _checkOcclusion(_currentI);
            
            _root[_downI + 1] = ByteMask.set7(_root[_downI + 1]);
            _checkOcclusion(_downI + 1);

            _root[_backI + 1] = ByteMask.set6(_root[_backI + 1]);
            _checkOcclusion(_backI + 1);

            _root[_leftI + 1] = ByteMask.set5(_root[_leftI + 1]);
            _checkOcclusion(_leftI + 1);

            _root[_rightI + 1] = ByteMask.set4(_root[_rightI + 1]);
            _checkOcclusion(_rightI + 1);

            _root[_frontI + 1] = ByteMask.set3(_root[_frontI + 1]);
            _checkOcclusion(_frontI + 1);

            _root[_upI + 1] = ByteMask.set2(_root[_upI + 1]);
            _checkOcclusion(_upI + 1);
        };
        this.addObjectAt = () => {};

        // const _worldSpace = new WorldSpace(sX, sY, sZ);
        // this.getAt = _worldSpace.getAt.bind(this);
        // this.setAt = _worldSpace.setAt.bind(this);
        // this.getObjects = _worldSpace.getObjects.bind(this);
        // this.addObjectAt = _worldSpace.addObjectAt.bind(this);
        // this.getVisibleObjects = _worldSpace.getVisibleObjects.bind(this);
        // this.getChunckIndexAt = _worldSpace.getChunckIndexAt.bind(this);

        this.index = (x, y, z) => ((z * sX * sY) + (y * sX) + x) * 2;

        this.getDimensions = () => [sX, sY, sZ];
        this.getX = () => sX;
        this.getY = () => sY;
        this.getZ = () => sZ;
        this.in = (x, y, z) => (x >= 0 && y >= 0 && z >= 0 && x < sX && y < sY && z < sZ);
        this.xIn = (x) => (x >= 0 && x < sX);
        this.yIn = (y) => (y >= 0 && y < sY);
        this.zIn = (z) => (z >= 0 && z < sZ);

        this.addMaterial = (material) => {
            material.index = materials.length;
            materials.push(material);
            return material.index;
        }

        this.getMaterial = (ref) => materials[ref];

        this.addShader = (shader) => {
            const _index = materials.length;
            materials.push(shader);
            return _index;
        }

        this.getShader = (ref) => materials[ref];
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

    maxRayDistance(origin, vector) {
        try {
            let maxsx = vector.x > 0 ? (this.getX() - origin.x) : origin.x;
            let maxsy = vector.y > 0 ? (this.getY() - origin.y) : origin.y;
            let maxsz = vector.z > 0 ? (this.getZ() - origin.z) : origin.z;

            let dx = maxsx - RENDER_DISTANCE;
            let dy = maxsy - RENDER_DISTANCE;
            let dz = maxsz - RENDER_DISTANCE;

            if(dx > 0 && dy > 0 && dz > 0) {
                let maxx = (vector.x * RENDER_DISTANCE) + origin.x;
                let maxy = (vector.y * RENDER_DISTANCE) + origin.y;
                let maxz = (vector.z * RENDER_DISTANCE) + origin.z;

                return new Point(
                    Math.floor(maxx),
                    Math.floor(maxy),
                    Math.floor(maxz)
                );
            }

            let delta;
            if(dx <= dy && dx <= dz) {
                delta = Math.abs(maxsx / vector.x);
            } else if (dy <= dx && dy <= dz) {
                delta = Math.abs(maxsy / vector.y);
            } else {
                delta = Math.abs(maxsz / vector.z);
            }

            return new Point(
                Math.floor((delta * vector.x) + origin.x),
                Math.floor((delta * vector.y) + origin.y),
                Math.floor((delta * vector.z) + origin.z)
            );
        } catch(err) {
            console.log(err);

            let maxx = (vector.x * RENDER_DISTANCE) + origin.x;
            let maxy = (vector.y * RENDER_DISTANCE) + origin.y;
            let maxz = (vector.z * RENDER_DISTANCE) + origin.z;

            return new Point(
                Math.floor(maxx),
                Math.floor(maxy),
                Math.floor(maxz)
            );
        }
    }

    rayTrace(origin, vector) {
        const stepx = (vector.x !== 0) ? Math.abs(1 / vector.x) : Number.MAX_VALUE;
        const stepy = (vector.y !== 0) ? Math.abs(1 / vector.y) : Number.MAX_VALUE;
        const stepz = (vector.z !== 0) ? Math.abs(1 / vector.z) : Number.MAX_VALUE;

        const directionx = (vector.x < 0) ? -1 : 1;
        const directiony = (vector.y < 0) ? -1 : 1;
        const directionz = (vector.z < 0) ? -1 : 1;
        
        let
        targetx = Math.floor(origin.x),
        targety = Math.floor(origin.y),
        targetz = Math.floor(origin.z),

        nextx = (vector.x !== 0) ? ((targetx + (directionx > 0 ? 1 : 0)) - origin.x) / vector.x : Number.MAX_VALUE,
        nexty = (vector.y !== 0) ? ((targety + (directiony > 0 ? 1 : 0)) - origin.y) / vector.y : Number.MAX_VALUE,
        nextz = (vector.z !== 0) ? ((targetz + (directionz > 0 ? 1 : 0)) - origin.z) / vector.z : Number.MAX_VALUE,

        maxx = (vector.x < 0) ? Math.max(0, targetx - RENDER_DISTANCE) : Math.min(this.getX(), RENDER_DISTANCE + targetx),
        maxy = (vector.y < 0) ? Math.max(0, targety - RENDER_DISTANCE) : Math.min(this.getY(), RENDER_DISTANCE + targety),
        maxz = (vector.z < 0) ? Math.max(0, targetz - RENDER_DISTANCE) : Math.min(this.getZ(), RENDER_DISTANCE + targetz),

        movex = (nextx <= nexty && nextx <= nextz),
        movey = (nexty <= nextx && nexty <= nextz),
        movez = (nextz <= nextx && nextz <= nexty),

        shaderRef = 0;

        do {
            if (shaderRef = this.getAt(targetx, targety, targetz)) {
                return new Ray(
                    this,
                    shaderRef,
                    origin.x, origin.y, origin.z,
                    vector.x, vector.y, vector.z,
                    stepx, stepy, stepz,
                    directionx, directiony, directionz,
                    targetx, targety, targetz,
                    nextx, nexty, nextz,
                    maxx, maxy, maxz,
                    movex, movey, movez
                );
            };

            movex = (nextx <= nexty && nextx <= nextz),
            movey = (nexty <= nextx && nexty <= nextz),
            movez = (nextz <= nextx && nextz <= nexty),

            nextx += movex * stepx;
            nexty += movey * stepy;
            nextz += movez * stepz;

            targetx += movex * directionx;
            targety += movey * directiony;
            targetz += movez * directionz;
            
        } while(
            targetx !== maxx &&
            targety !== maxy &&
            targetz !== maxz
        );

        return null;
    }

    rayCast(origin, vector, maxDistance) {
        const ray = new RayData(this, origin, vector, maxDistance);

        do {
            ray.shaderRef = this.getAt(ray.targetx, ray.targety, ray.targetz);

            if(ray.shaderRef) {
                ray.target = true;
                return ray;
            }

            ray.movex = (ray.nextx <= ray.nexty && ray.nextx <= ray.nextz),
            ray.movey = (ray.nexty <= ray.nextx && ray.nexty <= ray.nextz),
            ray.movez = (ray.nextz <= ray.nextx && ray.nextz <= ray.nexty),

            ray.nextx += ray.movex * ray.stepx;
            ray.nexty += ray.movey * ray.stepy;
            ray.nextz += ray.movez * ray.stepz;

            ray.targetx += ray.movex * ray.directionx;
            ray.targety += ray.movey * ray.directiony;
            ray.targetz += ray.movez * ray.directionz;
            
        } while(
            ray.targetx !== ray.maxx &&
            ray.targety !== ray.maxy &&
            ray.targetz !== ray.maxz
        );

        return ray;
    }

    recastRay(ray) {
        let shaderRef = 0;
        let passCount = 0;
        do {
            shaderRef = this.getAt(ray.targetx, ray.targety, ray.targetz);

            if(shaderRef !== ray.shaderRef) {
                ray.shaderRef = shaderRef;
                return new RayPath(shaderRef, passCount);
            };
                
            passCount++;

            ray.movex = (ray.nextx <= ray.nexty && ray.nextx <= ray.nextz),
            ray.movey = (ray.nexty <= ray.nextx && ray.nexty <= ray.nextz),
            ray.movez = (ray.nextz <= ray.nextx && ray.nextz <= ray.nexty),

            ray.nextx += ray.movex * ray.stepx;
            ray.nexty += ray.movey * ray.stepy;
            ray.nextz += ray.movez * ray.stepz;

            ray.targetx += ray.movex * ray.directionx;
            ray.targety += ray.movey * ray.directiony;
            ray.targetz += ray.movez * ray.directionz;
            
        } while(
            ray.targetx !== ray.maxx &&
            ray.targety !== ray.maxy &&
            ray.targetz !== ray.maxz
        );

        return null;
    }

    occluded(origin, end) {
        const distance = origin.distanceTo(end) + 1;
        const vector = Vector.fromPoints(origin, end);
        const destination = new Point(Math.floor(end.x), Math.floor(end.y), Math.floor(end.z));

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
        vx, vy, vz;

        // let
        // mx = (vector.x < 0) ? Math.max(0, v.x - RASTER_DISTANCE) : Math.min(this.getX(), RASTER_DISTANCE + v.x),
        // my = (vector.y < 0) ? Math.max(0, v.y - RASTER_DISTANCE) : Math.min(this.getY(), RASTER_DISTANCE + v.y),
        // mz = (vector.z < 0) ? Math.max(0, v.z - RASTER_DISTANCE) : Math.min(this.getZ(), RASTER_DISTANCE + v.z);

        let t;

        do {
            t = this.getAt(v.x, v.y, v.z);
            if (t) return true;

            vx = (tx <= ty && tx <= tz);
            vy = (ty <= tx && ty <= tz);
            vz = (tz <= tx && tz <= ty);

            tx += vx * dx;
            ty += vy * dy;
            tz += vz * dz;

            v.x += vx * sx;
            v.y += vy * sy;
            v.z += vz * sz;
        } while(
            t !== undefined &&
            distance > tx &&
            distance > ty &&
            distance > tz // &&
            // v.x !== mx &&
            // v.y !== my &&
            // v.z !== mz // &&
            // v.x !== destination.x &&
            // v.y !== destination.y &&
            // v.z !== destination.z
        );

        return false;
    }

    voxelOccluded(cameraPosition, x, y, z) {
        const p = 0.01; // precision point
        const ip = 1 + p; // precision point
        const origin = new Point(x, y, z);

        if(!this.occluded(cameraPosition, new Point(x - p,  y - p, z - p), origin)) return false;
        if(!this.occluded(cameraPosition, new Point(x + ip, y - p, z - p), origin)) return false;
        if(!this.occluded(cameraPosition, new Point(x - p,  y - p, z + ip), origin)) return false;
        if(!this.occluded(cameraPosition, new Point(x + ip, y - p, z + ip), origin)) return false;

        if(!this.occluded(cameraPosition, new Point(x - p,  y + ip, z - p), origin)) return false;
        if(!this.occluded(cameraPosition, new Point(x + ip, y + ip, z - p), origin)) return false;
        if(!this.occluded(cameraPosition, new Point(x - p,  y + ip, z + ip), origin)) return false;
        if(!this.occluded(cameraPosition, new Point(x + ip, y + ip, z + ip), origin)) return false;

        return true;
    }
}